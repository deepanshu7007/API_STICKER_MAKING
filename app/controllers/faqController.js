const db = require('../models');
const constants = require('../utls/constants');
// const excel = require('exceljs');
var mongoose = require('mongoose');
module.exports = {

    add: async (req , res)=>{
        try{
            const data = req.body

            if(!data.question || !data.answer || !data.category){
                return res.status(404).json({
                    success:false,
                    error:{code:404,message: constants.onBoarding.PAYLOAD_MISSING}
                })
            }
            let query = {isDeleted:false,question:data.question}
            let existed = await db.faqs.findOne(query)

            if(existed){
                return res.status(400).json({
                    success:false,
                    error:{code:400,message: constants.faqs.ALREADY_EXIST}
                })
            }
            data.addedBy = req.identity.id
            let created = await db.faqs.create(data)

            return res.status(200).json({
                success:true,
                message:constants.faqs.CREATED
            })
        }catch(err){
            return res.status(500).json({
                success:false,
                error:{code:500,message:""+err}
            })
        }
    },


    list:async (req, res)=>{
        try {

            const {search ,page ,count ,sortBy ,status ,category} = req.query
            var query = {};
      
            if (search) {
              query.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } },
              ];
            }      
            query.isDeleted = false;      
            var sortquery = {};
            if (sortBy) {
              var order = sortBy.split(' ');
              var field = order[0];
              var sortType = order[1];
            }
      
            sortquery[field ? field : 'createdAt'] = sortType
              ? sortType == 'desc'
                ? -1
                : 1
              : -1;
            if (status) {    query.status = status }
            if(category){query.category = category}
      
            const pipeline = [
                {
                    $match: query,
                  },
                  {
                    $sort: sortquery,
                  },
              {
                $lookup: {
                  from: 'users',
                  localField: 'addedBy',
                  foreignField: '_id',
                  as: 'addedByDetail',
                },
              },
      
              {
                $unwind: {
                  path: '$addedByDetail',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  id: '$_id',
                  question: '$question',
                  answer:"$answer",
                  category:"$category",
                  status: '$status',
                  createdAt: '$createdAt',
                  updatedAt: '$updatedAt',
                  isDeleted: '$isDeleted',
                  addedBy: '$addedBy',
                  addedByDetail: '$addedByDetail',
                },
              },
           
            ];
      
            const total = await db.faqs.aggregate([...pipeline]);
      
            if (page && count) {
              var skipNo = (Number(page) - 1) * Number(count);
      
              pipeline.push(
                {
                  $skip: Number(skipNo),
                },
                {
                  $limit: Number(count),
                }
              );
            }
      
            const result = await db.faqs.aggregate([...pipeline]);
      
            return res.status(200).json({
              success: true,
              data: result,
              total: total.length,
            });
          } catch (err) {
            return res.status(500).json({
              success: false,
              error: { code: 500, message: '' + err },
            });
          }
    },
    detail: async (req, res)=>{
        try{
            let {id} = req.query
            let query = {
              id:id,
              isDeleted:false
            }
            const detail = await db.faqs.findById(query)

            return res.status(200).json({
                success:true,
                data:detail
            })
        }catch(err){
            return res.status(500).json({
                success:false,
                error:{code:500,message:""+err}
            })
        }
    },

    update: async(req , res)=>{
        try {
            const id = req.body.id;
            const data = req.body;
      
            const updatedStatus = await db.faqs.updateOne(
              { _id: id },
             data
            );   
       
      
            return res.status(200).json({
              success: true,
              message: constants.faqs.UPDATED,
            });
          } catch (err) {
            return res.status(400).json({
              success: false,
              error: { code: 400, message: '' + err },
            });
          }
    },

    changeStatus: async (req, res) => {
        try {
          const id = req.body.id;
          const status = req.body.status;
    
          const updatedStatus = await db.faqs.updateOne(
            { _id: id },
            { status: status }
          );   
     
    
          return res.status(200).json({
            success: true,
            message: constants.faqs.STATUS_CHANGED,
          });
        } catch (err) {
          return res.status(400).json({
            success: false,
            error: { code: 400, message: '' + err },
          });
        }
      },

      delete: async (req, res)=>{
        try {
            const id = req.body.id;
      
            const updatedStatus = await db.faqs.updateOne(
              { _id: id },
              { isDeleted: true }
            );   
       
      
            return res.status(200).json({
              success: true,
              message: constants.faqs.DELETED,
            });
          } catch (err) {
            return res.status(400).json({
              success: false,
              error: { code: 400, message: '' + err },
            });
          }
      }
}
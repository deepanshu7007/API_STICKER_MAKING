'use strict';

const db = require('../models');
const Features = db.features;
const constants = require('../utls/constants');
var mongoose = require('mongoose');
const excel = require('exceljs');

module.exports = {
  /**
   * Creating features
   */

  createFeature: async (req, res) => {
    try {
      const data = req.body;

      if (!req.body.name) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      data.name = data.name;
      var query = {};
      query.isDeleted = false;
      query.name = data.name;
      const existed = await Features.findOne(query);

      if (existed) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.features.ALREADY_EXIST,
          },
        });
      }

      const features = new Features(data);

      const created = await features.save(features);

      return res.status(200).json({
        success: true,
        message: constants.features.CREATED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  /**Getting features detail data using id */
  featureDetail: async (req, res) => {
    try {
      const id = req.query.id;

      const features = await Features.findById(id);

      return res.status(200).json({
        success: true,
        data: features,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  updateFeature: async (req, res) => {
    try {
      if (!req.body.id || !req.body.name) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      req.body.name = req.body.name;
      var query = {};
      query.isDeleted = false;
      query.name = req.body.name;
      query._id = { $ne: mongoose.Types.ObjectId(req.body.id) };
      const existed = await Features.findOne(query);
      if (existed) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.features.ALREADY_EXIST,
          },
        });
      }

      const updatedCurrency = await Features.updateOne(
        { _id: req.body.id },
        req.body
      );

      return res.status(200).json({
        success: true,
        message: constants.features.UPDATED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  getAllFeatures: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      let status = req.query.status;
      let exports_to_xls = req.query.exports_to_xls;

      var count = req.query.count;

      var query = {};

      if (search) {
        query.$or = [
          {
            name: { $regex: search, $options: 'i' },
          },
          { categoryName: { $regex: search, $options: 'i' } },
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
        ? sortType == 'asc'
          ? 1
          : -1
        : 1;
      if (status) {
        query.status = status;
      }

      if (category) {
        query.categoryId = mongoose.Types.ObjectId(category);
      }

      const pipeline = [
        
        {
          $project: {
            id: '$_id',
            name: '$name',
            status: '$status',
            createdAt: '$createdAt',
            description: '$description',
            isDeleted: '$isDeleted',
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await Features.aggregate([...pipeline]);

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

      const result = await Features.aggregate([...pipeline]);

      if(exports_to_xls){
        var FeaturesData = [];
        var counter = 1;
        for await (let obj of result) {
          if (obj.status == 'deactive') {
            obj.status = 'Inactive';
          }
          FeaturesData.push({
            counter: counter || '-',
            name: obj.name || '-',
            status: obj.status || '-',
            description: obj.description || '-',
            createdAt: new Date(obj.createdAt).toDateString(),
          });
  
          counter++;
        }
        var excelFileName = `FeaturesDetails`;
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet(excelFileName);
  
        worksheet.columns = [
          { header: 'Serial No.', key: 'counter', width: 10 },
          { header: 'Name', key: 'name', width: 15 },
          
          { header: 'Tooltip', key: 'description', width: 10 },
          { header: 'Status', key: 'status', width: 10 },
          { header: 'Creation Date', key: 'createdAt', width: 17 },
        ];
  
        // Add Array Rows
        worksheet.addRows(FeaturesData);
  
        // Add autofilter on each column
        worksheet.autoFilter = 'A1:D1';
  
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=' + excelFileName + '.xlsx'
        );
  
        return workbook.xlsx.write(res).then(function () {
          res.status(200).end();
        });
      }
      

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

  changeStatus: async (req, res) => {
    try {
      const id = req.body.id;
      const status = req.body.status;

      const updatedStatus = await Features.updateOne(
        { _id: id },
        { status: status }
      );

      return res.status(200).json({
        success: true,
        message: constants.features.STATUS_CHANGED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  deleteFeature: async (req, res) => {
    try {
      const id = req.query.id;
      const deletedUser = await Features.updateOne(
        { _id: id },
        { isDeleted: true }
      );

      return res.status(200).json({
        success: true,
        message: constants.features.DELETED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  // /**Generate Excel sheet */
  // exportFeaturesData: async (req, res) => {
  //   try {
  //     var search = req.query.search;
  //     var page = req.query.page;
  //     var sortBy = req.query.sortBy;
  //     let status = req.query.status;

  //     var count = req.query.count;

  //     var query = {};

  //     if (search) {
  //       query.$or = [
  //         {
  //           name: { $regex: search, $options: 'i' },
  //         },
  //       ];
  //     }

  //     query.isDeleted = false;

  //     var sortquery = {};
  //     if (sortBy) {
  //       var order = sortBy.split(' ');
  //       var field = order[0];
  //       var sortType = order[1];
  //     }

  //     sortquery[field ? field : 'createdAt'] = sortType
  //       ? sortType == 'desc'
  //         ? -1
  //         : 1
  //       : -1;
  //     if (status) {
  //       query.status = status;
  //     }

  //     const pipeline = [
  //       {
  //         $lookup: {
  //           from: 'categories',
  //           localField: 'category',
  //           foreignField: '_id',
  //           as: 'category',
  //         },
  //       },

  //       {
  //         $unwind: {
  //           path: '$category',
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },
  //       {
  //         $project: {
  //           id: '$_id',
  //           name: '$name',
  //           category: '$category',
  //           categoryName: '$category.name',
  //           description: '$description',
  //           status: '$status',
  //           createdAt: '$createdAt',
  //           updatedAt: '$updatedAt',
  //           isDeleted: '$isDeleted',
  //         },
  //       },
  //       {
  //         $match: query,
  //       },
  //       {
  //         $sort: sortquery,
  //       },
  //     ];

  //     const total = await Features.aggregate([...pipeline]);

  //     if (page && count) {
  //       var skipNo = (Number(page) - 1) * Number(count);

  //       pipeline.push(
  //         {
  //           $skip: Number(skipNo),
  //         },
  //         {
  //           $limit: Number(count),
  //         }
  //       );
  //     }

  //     const result = await Features.aggregate([...pipeline]);
  //     var FeaturesData = [];
  //     var counter = 1;
  //     for await (let obj of result) {
  //       if (obj.status == 'deactive') {
  //         obj.status = 'Inactive';
  //       }
  //       FeaturesData.push({
  //         counter: counter || '-',
  //         categoryName: obj.categoryName || '-',
  //         name: obj.name || '-',
  //         status: obj.status || '-',
  //         description: obj.description || '-',
  //         createdAt: new Date(obj.createdAt).toDateString(),
  //       });

  //       counter++;
  //     }
  //     var excelFileName = `FeaturesDetails`;
  //     let workbook = new excel.Workbook();
  //     let worksheet = workbook.addWorksheet(excelFileName);

  //     worksheet.columns = [
  //       { header: 'Serial No.', key: 'counter', width: 10 },
  //       { header: 'Name', key: 'name', width: 15 },
  //       { header: 'Category', key: 'categoryName', width: 15 },
  //       { header: 'Tooltip', key: 'description', width: 10 },
  //       { header: 'Status', key: 'status', width: 10 },
  //       { header: 'Creation Date', key: 'createdAt', width: 17 },
  //     ];

  //     // Add Array Rows
  //     worksheet.addRows(FeaturesData);

  //     // Add autofilter on each column
  //     worksheet.autoFilter = 'A1:D1';

  //     res.setHeader(
  //       'Content-Type',
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //     );
  //     res.setHeader(
  //       'Content-Disposition',
  //       'attachment; filename=' + excelFileName + '.xlsx'
  //     );

  //     return workbook.xlsx.write(res).then(function () {
  //       res.status(200).end();
  //     });
  //   } catch (err) {
  //     console.log(err, 'err');
  //     return res.status(500).json({
  //       success: false,
  //       error: { code: 500, message: '' + err },
  //     });
  //   }
  // },



  // featureDragDrop: async (req, res) => {
  //   try {
  //     const data = req.body.data;
  //     if (data && data.length > 0) {
  //       for await (const itm of data) {
  //         const updatedPlan = await db.features.updateOne({ _id: itm.id }, itm);
  //       }

  //       return res.status(200).json({
  //         success: true,
  //         message: constants.features.ORDER_UPDATED,
  //       });
  //     } else {
  //       return res.status(400).json({
  //         success: false,
  //         error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
  //       });
  //     }
  //   } catch (err) {
  //     return res.status(400).json({
  //       success: false,
  //       error: { code: 400, message: '' + err },
  //     });
  //   }
  // },
};

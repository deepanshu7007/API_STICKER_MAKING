'use strict';

const db = require('../models');
const Items = db.items;
const constants = require('../utls/constants');
var mongoose = require('mongoose');
const excel = require('exceljs');

module.exports = {
  /**
   * Creating Item
   */

  createItem: async (req, res) => {
    try {
      const data = req.body;

      if (!req.body.itemName || !req.body.barcode || !req.body.price || !req.body.size || !req.body.size_type) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.Item.PAYLOAD_MISSING },
        });
      }
      var query = {};
      query.isDeleted = false;
      query.itemName = data.itemName;
      const existed = await Items.findOne(query);
      if (existed) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.Item.ALREADY_EXIST,
          },
        });
      }

      const items = new Items(data);

      const itemCreated = await items.save(items);

      return res.status(200).json({
        success: true,
        message: constants.Item.CREATED,
        data: itemCreated
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  /**Getting features detail data using id */
  itemDetail: async (req, res) => {
    try {
      const id = Number(req.query.id);

      const item = await Items.find({itemCode:id});

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  updateItem: async (req, res) => {
    try {
      if (!req.body.id || !req.body.itemName || !req.body.barcode || !req.body.price || !req.body.size || !req.body.size_type) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.Item.PAYLOAD_MISSING },
        });
      }
      //   var query = {};
      //   query.isDeleted = false;
      //   query.itemName = req.body.itemName;
      //   query._id = { $ne: new mongoose.Types.ObjectId(req.body.id) };
      // //   console.log(query,"==============");
      //   const existed = await Items.findOne(query);
      //   if (existed) {
      //     return res.status(400).json({
      //       success: false,
      //       error: {
      //         code: 400,
      //         message: constants.Item.ALREADY_EXIST,
      //       },
      //     });
      //   }

      const updatedItem = await Items.findOneAndUpdate(
        { _id: req.body.id },
        req.body, {
        new: true
      }
      );

      return res.status(200).json({
        success: true,
        message: constants.Item.UPDATED,
        data: updatedItem
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  getAllItems: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      let status = req.query.status;
      let size_type = req.query.size_type;
      let exports_to_xls = req.query.exports_to_xls;

      var count = req.query.count;

      var query = {};

      if (search) {
        query.$or = [
          {
            itemName: { $regex: search, $options: 'i' },
          },
          { price: { $regex: search, $options: 'i' } },
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

      if (size_type) {
        query.size_type = size_type
      }

      const pipeline = [

        {
          $project: {
            id: '$_id',
            itemName: "$itemName",
            barcode: "$barcode",
            model: "$model",
            price: "$price",
            size: "$size",
            size_type: "$size_type",
            status: '$status',
            createdAt: '$createdAt',
            updatedAt:"$updatedAt",
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

      const total = await Items.aggregate([...pipeline]);

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

      const result = await Items.aggregate([...pipeline]);

      if (exports_to_xls) {
        var ItemsData = [];
        var counter = 1;
        for await (let obj of result) {
          if (obj.status == 'deactive') {
            obj.status = 'Inactive';
          }
          ItemsData.push({
            counter: counter || '-',
            name: obj.name || '-',
            status: obj.status || '-',
            description: obj.description || '-',
            createdAt: new Date(obj.createdAt).toDateString(),
          });

          counter++;
        }
        var excelFileName = `ItemsDetails`;
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
        worksheet.addRows(ItemsData);

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

      const updatedStatus = await Items.updateOne(
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

  deleteItem: async (req, res) => {
    try {
      const id = req.query.id;
      const itemDeleted = await Items.updateOne(
        { _id: id },
        { isDeleted: true }
      );

      return res.status(200).json({
        success: true,
        message: constants.Item.DELETED,
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
};

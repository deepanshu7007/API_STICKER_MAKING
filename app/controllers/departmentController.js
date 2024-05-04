const db = require("../models");
const constants = require("../utls/constants");
// const excel = require('exceljs');
var mongoose = require("mongoose");

const Department = db.department;
module.exports = {
  addDepartment: async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.DEPARTMENT.PAYLOAD_MISSING },
        });
      }
      
      let query = { isDeleted: false,addedBy:req.identity._id,name:req.body.name };
        console.log(query,"=============");
      let existed = await Department.findOne(query);
      console.log(existed);
      if (existed) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.DEPARTMENT.ALREADY_EXIST },
        });
      }
      req.body.addedBy = req.identity.id;
      let created = await Department.create(req.body);
      if (created) {
        return res.status(200).json({
          success: true,
          message: constants.DEPARTMENT.CREATED,
          data: created,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Some issue exist",
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },

  depatment_detail: async (req, res) => {
    try {
      let { id } = req.query;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.DEPARTMENT.ID_MISSING },
        });
      }
      let query = {
        id: id,
        isDeleted: false,
      };
      const detail = await Department.findById(id);
      
      return res.status(200).json({
        success: true,
        data: detail,
        message: constants.DEPARTMENT.FETCHED
      });
    } catch (err) {
      console.log(err,'===er');
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },

  update_department: async (req, res) => {
    try {
      const id = req.body.id;
      const data = req.body;

      const updatedStatus = await db.department.updateOne({ _id: id }, data);

      return res.status(200).json({
        success: true,
        message: constants.DEPARTMENT.UPDATED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  delete_depatment: async (req, res) => {
    try {
      const id = req.query.id;

      const updatedStatus = await db.department.updateOne(
        { _id: id },
        { isDeleted: true }
      );

      return res.status(200).json({
        success: true,
        message: constants.DEPARTMENT.DELETED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  getAllDepartment: async (req, res) => {
    try {
      const { search, page, count, sortBy, status, addedBy } = req.query;
      var query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
        ];
      }
      query.isDeleted = false;
      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(" ");
        var field = order[0];
        var sortType = order[1];
      }

      sortquery[field ? field : "createdAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }
      if (addedBy) {
        query.addedBy = new mongoose.Types.ObjectId(addedBy);
      }

      const pipeline = [
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
        {
          $lookup: {
            from: "users",
            localField: "addedBy",
            foreignField: "_id",
            as: "addedByDetail",
          },
        },

        {
          $unwind: {
            path: "$addedByDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: "$_id",
            name: "$name",
            status: "$status",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            isDeleted: "$isDeleted",
            addedBy: "$addedBy",
            addedByDetail: "$addedByDetail",
          },
        },
      ];

      const total = await db.department.aggregate([...pipeline]);

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

      const result = await db.department.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },
};

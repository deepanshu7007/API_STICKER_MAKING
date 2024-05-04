"use strict";

const db = require("../models");

const Users = db.users;
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../utls/constants");
const Emails = require("../Emails/onBoarding");
const helper = require("../utls/helper");
// const excel = require('exceljs');
var mongoose = require("mongoose");

const services = require("../services");
const { log } = require("console");
// Set up your OAuth2 credentials

function generatePassword() {
  // action are perform to generate VeificationCode for user
  var length = 4;
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var retVal = "";

  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  var lowercase = "abcdefghijklmnopqrstuvwxyz";
  var lowercaseCharacterLength = 2;
  for (var i = 0, n = lowercase.length; i < lowercaseCharacterLength; ++i) {
    retVal += lowercase.charAt(Math.floor(Math.random() * n));
  }

  let specialCharacter = "@%$#&-!";
  let specialCharacterLength = 1;

  for (
    var i = 0, n = specialCharacter.length;
    i < specialCharacterLength;
    ++i
  ) {
    retVal += specialCharacter.charAt(Math.floor(Math.random() * n));
  }
  var numeric = "0123456789";
  var numericLength = 2;
  for (var i = 0, n = numeric.length; i < numericLength; ++i) {
    retVal += numeric.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}
module.exports = {
  /**
   * @authenticated
   *
   */
  registerUser: async (req, res) => {
    try {
      console.log("Inside register user");
      const data = req.body;

      if (!req.body.email || !req.body.password) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }

      const date = new Date();
      data["status"] = "active";
      data["role"] = req.body.role ? req.body.role : "user";
      const password = data.password;
      data.password = await bcrypt.hashSync(
        data.password,
        bcrypt.genSaltSync(10)
      );
      data.isVerified = "N";
      data.createdAt = new Date();
      data.updatedAt = new Date();
      data.isDeleted = false;
      data.email = data.email.toLowerCase();

      if (req.body.firstName && req.body.lastName) {
        data["fullName"] = req.body.firstName + " " + req.body.lastName;
      }
      var query = {};
      query.isDeleted = false;
      query.email = data.email;
      const existedUser = await Users.findOne(query);

      if (existedUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: "Email already exist in the application.",
          },
        });
      }

      // Save user in the database
      if (data.country) {
        data["country"] = data.country.toLowerCase();
      }
      if (data.email) {
        data["email"] = data.email.toLowerCase();
      }

      const createdUser = await Users.create(data);
      let emailPayload = {
        email: createdUser.email,
        fullName: createdUser.fullName,
        id: createdUser.id,
        role: createdUser.role,
      };

      await Emails.userVerifyLink(emailPayload);

      return res.status(200).json({
        success: true,
        message: "User register successfully.",
        data: createdUser,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },
  /***Admin Login */
  adminLogin: async (req, res) => {
    try {
      const data = req.body;
      if (!req.body.email || typeof req.body.email == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.EMAIL_REQUIRED },
        });
      }

      if (!req.body.password || typeof req.body.password == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.PASSWORD_REQUIRED },
        });
      }

      var query = {};
      query.email = data.email.toLowerCase();
      query.isDeleted = false;

      var user = await Users.findOne(query);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Invalid credentials." },
        });
      }

      if (user && user.status == "deactive") {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.onBoarding.USERNAME_INACTIVE,
          },
        });
      }

      // let unallowedRoles = ["64b15102b14de6c28838f7d2"];

      // if (unallowedRoles.includes(user.role.id)) {
      //   return res.status(400).json({
      //     success: false,
      //     error: {
      //       code: 400,
      //       message: "You are not authorized user for this portal.",
      //     },
      //   });
      // }

      if (user && user.status != "active" && user.isVerified != "Y") {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.onBoarding.USERNAME_INACTIVE,
          },
        });
      }

      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.onBoarding.WRONG_PASSWORD,
          },
        });
      } else {
        const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "200h",
          }
        );
        var admindata;
        admindata = Object.assign({}, user._doc);
        admindata["access_token"] = token;

        return res.status(200).json({
          success: true,
          message: constants.onBoarding.LOGIN_SUCCESS,
          data: admindata,
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  /***User Login */
  userLogin: async (req, res) => {
    try {
      const data = req.body;
      if (!req.body.email || typeof req.body.email == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.EMAIL_REQUIRED },
        });
      }

      if (!req.body.password || typeof req.body.password == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.PASSWORD_REQUIRED },
        });
      }

      var query = {};
      query.email = data.email.toLowerCase();

      query.isDeleted = false;
      var user = await Users.findOne(query);
      if(user && user.role === 'admin'){
        return res.status(400).json({
          success:false,
          error : {code:400,message: constants.onBoarding.ONLY_USER_LOGIN}
        })
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.NO_USER_EXIST },
        });
      }

      if (user && user.status == "deactive") {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.onBoarding.USERNAME_INACTIVE,
          },
        });
      }

      if (user && user.isVerified != "Y") {
        return res.status(404).json({
          success: false,
          id: user.id,
          error: {
            code: 404,
            message: constants.onBoarding.NOT_VERIFIED,
          },
        });
      }

      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.onBoarding.WRONG_PASSWORD,
          },
        });
      } else {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "10h",
          }
        );
        // user["access_token"] = token

        let userData = Object.assign({}, user._doc);

        userData["access_token"] = token;

        return res.status(200).json({
          success: true,
          message: constants.onBoarding.LOGIN_SUCCESS,
          data: userData,
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  /***Auto Login */
  autoLogin: async (req, res) => {
    try {
      const id = req.body.id;
      var user = await Users.findById(id);
      if (!user) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Invalid credentials." },
        });
      }

      if (user && user.status == "deactive") {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.onBoarding.USERNAME_INACTIVE,
          },
        });
      }

      // if (user && user.isVerified != 'Y') {
      //   return res.status(404).json({
      //     success: false,
      //     error: {
      //       code: 404,
      //       message: constants.onBoarding.NOT_VERIFIED,
      //     },
      //   });
      // }
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "10h",
        }
      );
      var admindata;
      admindata = Object.assign({}, user._doc);
      admindata["access_token"] = token;
      const updatedUser = await db.users.updateOne(
        { _id: admindata.id },
        { lastLogin: new Date() }
      );
      return res.status(200).json({
        success: true,
        message: constants.onBoarding.LOGIN_SUCCESS,
        data: admindata,
      });
      // }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },
  /**Getting user profile data using id */
  profileData: async (req, res) => {
    try {
      // console.log('here');
      const id = req.query.id;

      const user = await Users.findById(id);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  /**Updating user profile */
  /**
   * @queryParam id
   * @param {*} req
   * @param {*} res
   * @returns
   */
  updateProfile: async (req, res) => {
    try {
      if (!req.body.id) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      if (req.body.firstName && req.body.lastName) {
        req.body.fullName = req.body.firstName + " " + req.body.lastName;
      }

      const user = await Users.findById({ _id: req.body.id });
      var password;

      /**Updating password if present in payload */
      if (req.body.password) {
        password = req.body.password;
        req.body.password = await bcrypt.hashSync(
          req.body.password,
          bcrypt.genSaltSync(10)
        );

        let emailPayload = {
          email: user.email,
          fullName: user.fullName,
          password: password,
        };

        await Emails.updatePasswordEmail(emailPayload);
      }
      const updatedUser = await Users.updateOne({ _id: req.body.id }, req.body);

      // if (updatedUser) {
      //   let userData = await Users.findById({ _id: req.body.id });
      //   console.log(userData)

      //   userData.role = role;

      // }

      return res.status(200).json({
        success: true,
        message: constants.onBoarding.PROFILE_UPDATED,
      });
    } catch (err) {
      // console.log(err,"============================")
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      let status = req.query.status;
      let role = req.query.role;
      let addedBy = req.query.addedBy;
      let type = req.query.type;
      let department = req.query.department;
      var count = req.query.count;

      let country = req.query.country;
      let planId = req.query.plan;
      let startDate = req.query.startDate;
      let endDate = req.query.endDate;
      let planStatus = req.query.planStatus;
      var query = {};
console.log("=======================")
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },

          // Add more fields as needed
        ];
      }

      // if (endDate && startDate) {
      //   query.validFrom = {
      //     $gte: new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)),
      //   };
      //   query.validUpTo = {
      //     $lte: new Date(new Date(endDate).setUTCHours(23, 59, 59, 0)),
      //   };
      // }

      // if (planStatus == "trial") {
      //   query.on_trial = true;
      // } else if (planStatus) {
      //   query.planStatus = planStatus;
      // }

      query.isDeleted = false;

      if (role) {
        query.role = role;
      } else {
        query.role = { $nin: ["admin"] };
      }

      if (planId) {
        query.planId = mongoose.Types.ObjectId(planId);
      }
      if (department) {
        query.department = mongoose.Types.ObjectId(department);
      }
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
      if (type) {
        query.type = type;
      }
      if (addedBy) {
        query.addedBy = new mongoose.Types.ObjectId(addedBy);
      }
      if (country) {
        query.country = country;
      }

      const pipeline = [
        {
          $lookup: {
            from: "departments",
            localField: "department",
            foreignField: "_id",
            as: "departmentDetail",
          },
        },

        {
          $unwind: {
            path: "$departmentDetail",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            id: "$_id",
            verificationCode: "$verificationCode",
            email: "$email",
            city: "$city",
            state: "state",
            dialCode: "$dialCode",
            mobileNo: "$mobileNo",
            fullName: "$fullName",
            address: "$address",
            image: "$image",
            country: "$country",
            email: "$email",
            pinCode: "$pinCode",
            status: "$status",
            role: "$role",
            company: "$company",
            goal: "$goal",
            type: "$type",
            department: "$department",
            departmentName: "$departmentDetail.name",
            currency: "$currency",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            addedBy: "$addedBy",
            isDeleted: "$isDeleted",
            planId: "$planId",
            subscriptionDetail: "$subscriptionDetail",
            planStatus: "$subscriptionDetail.status",
            validUpTo: "$subscriptionDetail.validUpTo",
            validFrom: "$subscriptionDetail.createdAt",
            preferName: "$preferName",
            preferName: "$preferName",
            preferName: "$preferName",
            preferName: "$preferName",
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await Users.aggregate([...pipeline]);

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

      const result = await Users.aggregate([...pipeline]);

      if (result && result.length > 0) {
        for await (let user of result) {
          const plans = await db.subscriptions
            .find({ userId: user._id })
            .sort({ createdAt: -1 })
            .populate("planId");
          if (plans && plans.length > 0) {
            user.plan = plans[0];
          }
        }
      }
      // if (result.length > 0) {
      //   await helper.setRedisData('usersList', total)
      // }
      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      // console.log(err);
      return res.status(500).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  // getAdminUsers: async (req, res) => {
  //   try {
  //     var search = req.query.search;
  //     var page = req.query.page;
  //     var sortBy = req.query.sortBy;
  //     let status = req.query.status;
  //     let role = req.query.role;

  //     var count = req.query.count;

  //     var query = {};

  //     if (search) {
  //       query.$or = [
  //         { fullName: { $regex: search, $options: "i" } },
  //         { email: { $regex: search, $options: "i" } },
  //         { mobileNo: { $regex: search, $options: "i" } },
  //         // Add more fields as needed
  //       ];
  //     }

  //     query.isDeleted = false;

  //     query.roleId = {
  //       $ne: mongoose.Types.ObjectId("64b15102b14de6c28838f7d2"),
  //     };

  //     var sortquery = {};
  //     if (sortBy) {
  //       var order = sortBy.split(" ");
  //       var field = order[0];
  //       var sortType = order[1];
  //     }

  //     sortquery[field ? field : "createdAt"] = sortType
  //       ? sortType == "desc"
  //         ? -1
  //         : 1
  //       : -1;
  //     if (status) {
  //       query.status = status;
  //     }

  //     // const cache = await helper.getRedisData('adminUsers')
  //     // if (cache && cache.length > 0 && !search) {

  //     //   if (page && count) {
  //     //     let resData = cache.sort((a, b) => {
  //     //       return new Date(b.createdAt) - new Date(a.createdAt)
  //     //     });

  //     //     if (status) {
  //     //       resData = resData.filter((obj) => {
  //     //         return obj.status == status
  //     //       })
  //     //     }

  //     //     if (role) {
  //     //       resData = resData.filter((obj) => {
  //     //         if (obj.role && obj.role._id) {
  //     //           return String(obj.role._id) == String(role)
  //     //         }
  //     //       })
  //     //     } else {
  //     //       resData = resData.filter((obj) => {
  //     //         return String(obj.role._id) != String("64b15102b14de6c28838f7d2")
  //     //       })
  //     //     }
  //     //     const slicedArray = resData.slice(
  //     //       (Number(page) - 1) * Number(count),
  //     //       Number(page) * Number(count)
  //     //     );
  //     //     return res.status(200).json({
  //     //       success: true,
  //     //       data: slicedArray,
  //     //       total: resData.length
  //     //     })
  //     //   } else {

  //     //     let resData = helper.array_of_obj_sort(cache, field, sortType)

  //     //     if (status) {
  //     //       resData = resData.filter((obj) => {
  //     //         return obj.status == status
  //     //       })
  //     //     }

  //     //     if (role) {
  //     //       resData = resData.filter((obj) => {
  //     //         return String(obj.role._id) == String(role)
  //     //       })
  //     //     }
  //     //     return res.status(200).json({
  //     //       success: true,
  //     //       data: resData,
  //     //       total: resData.length
  //     //     })
  //     //   }

  //     // }
  //     const pipeline = [
  //       {
  //         $lookup: {
  //           from: "roles",
  //           localField: "role",
  //           foreignField: "_id",
  //           as: "role",
  //         },
  //       },

  //       {
  //         $unwind: {
  //           path: "$role",
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },
  //       {
  //         $project: {
  //           id: "$_id",

  //           firstName: "$firstName",
  //           lastName: "$lastName",
  //           dialCode: "$dialCode",
  //           mobileNo: "$mobileNo",
  //           fullName: "$fullName",
  //           address: "$address",
  //           image: "$image",
  //           email: "$email",
  //           financialYear: "$financialYear",
  //           status: "$status",
  //           role: "$role",
  //           roleId: "$role._id",
  //           roleName: "$role.name",
  //           companyDateFormat: "$companyDateFormat",
  //           currency: "$currency",
  //           lastLogin: "$lastLogin",
  //           createdAt: "$createdAt",
  //           updatedAt: "$updatedAt",
  //           isDeleted: "$isDeleted",
  //         },
  //       },
  //       {
  //         $match: query,
  //       },
  //       {
  //         $sort: sortquery,
  //       },
  //     ];

  //     const total = await Users.aggregate([...pipeline]);

  //     // if (total.length > 0) {
  //     //   await helper.setRedisData('adminUsers', total)
  //     // }

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

  //     const result = await Users.aggregate([...pipeline]);

  //     return res.status(200).json({
  //       success: true,
  //       data: result,
  //       total: total.length,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json({
  //       success: false,
  //       error: { code: 400, message: "" + err },
  //     });
  //   }
  // },

  changePassword: async (req, res) => {
    try {
      const newPassword = req.body.newPassword;
      const currentPassword = req.body.currentPassword;
      const user = await Users.findById({ _id: req.identity.id });
      if (!bcrypt.compareSync(currentPassword, user.password)) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.CURRENT_PASSWORD },
        });
      } else {
        const password = await bcrypt.hashSync(
          newPassword,
          bcrypt.genSaltSync(10)
        );
        await Users.findByIdAndUpdate(user._id, { password: password });

        return res.status(200).json({
          success: true,
          message: constants.onBoarding.PASSWORD_CHANGED,
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  forgotPasswordAdmin: async (req, res) => {
    try {
      if (!req.body.email || req.body.email == undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      var query = {};
      query.email = req.body.email.toLowerCase();
      query.isDeleted = false;
      query.role = "admin";

      const user = await Users.findOne(query);
      if (user) {
        const verificationCode = await helper.generateVerificationCode(6);

        await Users.updateOne(
          { _id: user.id },
          { verificationCode: verificationCode }
        );
        let currentTime = new Date();
        let email_payload = {
          email: user.email,
          verificationCode: verificationCode,
          fullName: user.fullName,
          id: user.id,
          userId: user.id,
          time: currentTime,
          role: user.role,
        };
        await Emails.forgotPasswordEmail(email_payload);
        return res.status(200).json({
          success: true,
          message: constants.onBoarding.VERIFICATION_CODE_SENT,
          id: user.id,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.ACCOUNT_NOT_FOUND },
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.toString() },
      });
    }
  },

  forgotPasswordUser: async (req, res) => {
    try {
      if (!req.body.email || req.body.email == undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }

      var query = {};
      query.email = req.body.email.toLowerCase();
      query.isDeleted = false;

      const user = await Users.findOne(query);
      if (user) {
        const verificationCode = await helper.generateVerificationCode(6);

        await Users.updateOne(
          { _id: user.id },
          { verificationCode: verificationCode }
        );
        let currentTime = new Date();
        let email_payload = {
          email: user.email,
          verificationCode: verificationCode,
          firstName: user.fullName,
          id: user.id,
          userId: user.id,
          time: currentTime,
          role: user.role,
        };
        await Emails.forgotPasswordEmail(email_payload);
        return res.status(200).json({
          success: true,
          message: constants.onBoarding.VERIFICATION_CODE_SENT,
          id: user.id,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.ACCOUNT_NOT_FOUND },
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.toString() },
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const id = req.body.id;

      if (!req.body.password || !req.body.verificationCode) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }

      const user = await Users.findById(id);

      if (user.verificationCode != req.body.verificationCode) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.WRONG_VERIFICATION_CODE,
          },
        });
      }

      const password = await bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(10)
      );
      await Users.updateOne(
        { _id: user.id },
        { password: password, verificationCode: "" }
      );

      return res.status(200).json({
        success: true,
        message: constants.onBoarding.PASSWORD_RESET,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.toString() },
      });
    }
  },

  addUser: async (req, res) => {
    var date = new Date();
    try {
      const data = req.body;

      if (!req.body.email || !req.body.fullName) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      let query = {};
      query.isDeleted = false;
      query.email = req.body.email.toLowerCase();
      var user = await Users.findOne(query);
      let role = req.body.role ? req.body.role : "user";

      if (user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.EMAIL_EXIST,
          },
        });
      } else {
        data["date_registered"] = date;
        data["createdAt"] = date;
        data["updatedAt"] = date;
        data["status"] = "active";
        data["role"] = req.body.role ? req.body.role : "user";
        data["addedBy"] = req.identity.id;
        var password = req.body.password;
        if (req.body.password) {
          data.password = await bcrypt.hashSync(
            req.body.password,
            bcrypt.genSaltSync(10)
          );
        } else {
          password = await generatePassword();
          data.password = await bcrypt.hashSync(
            password,
            bcrypt.genSaltSync(10)
          );
        }

        data.isVerified = "Y";
        data.email = data.email.toLowerCase();

        if (req.body.firstName && req.body.lastName) {
          data["fullName"] = req.body.firstName + " " + req.body.lastName;
        }
        data.addedBy = req.identity.id ? req.identity.id : req.identity._id
        // Create a user
        const user = new Users(data);

        // Save user in the database
        const newUser = await user.save(user);

        let email_payload = {
          email: newUser.email,
          fullName: newUser.fullName,
          password: password,
          role:newUser.role
        };
        await Emails.add_user_email(email_payload);

        return res.status(200).json({
          success: true,
          data: newUser,
          message: constants.onBoarding.USER_ADDED,
        });
      }
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, code: 400, message: "" + err });
    }
  },

  changeStatus: async (req, res) => {
    try {
      const id = req.body.id;
      const status = req.body.status;

      const updatedStatus = await Users.updateOne(
        { _id: id },
        { status: status }
      );

      // if (updatedStatus) {
      //   let userData = await Users.findById({ _id: req.body.id });

      //   userData.role = role;

      // }

      return res.status(200).json({
        success: true,
        message: constants.onBoarding.STATUS_CHANGED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.query.id;
      let user = await db.users.findById(id);
      if (user) {
        var deletedUser = await Users.findByIdAndUpdate(id, {
          isDeleted: true,
        });
      }

      return res.status(200).json({
        success: true,
        message: constants.onBoarding.USER_DELETED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  /**Generate Excel sheet */
  exportUserData: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      let status = req.query.status;
      let role = req.query.role;

      var count = req.query.count;

      var query = {};

      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          // Add more fields as needed
        ];
      }

      query.isDeleted = false;
      query.role = { $ne: "admin" };
      if (role) {
        query.role = role;
      }
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

      const pipeline = [
        {
          $lookup: {
            from: "roles",
            localField: "role",
            foreignField: "_id",
            as: "role",
          },
        },

        {
          $unwind: {
            path: "$role",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: "$_id",

            firstName: "$firstName",
            lastName: "$lastName",
            dialCode: "$dialCode",
            mobileNo: "$mobileNo",
            fullName: "$fullName",
            address: "$address",
            image: "$image",
            email: "$email",
            status: "$status",
            role: "$role",
            createdAt: "$createdAt",
            isDeleted: "$isDeleted",
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await Users.aggregate([...pipeline]);

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

      const result = await Users.aggregate([...pipeline]);
      var UserData = [];
      var counter = 1;
      for await (let obj of result) {
        if (obj.status == "deactive") {
          obj.status = "Inactive";
        }
        UserData.push({
          counter: counter || "-",
          firstName: obj.firstName || "-",
          // lastName: lastName || '-',
          dialCode: obj.dialCode || "-",
          mobileNo: obj.mobileNo || "-",
          fullName: obj.fullName,
          address: obj.address,
          email: obj.email,
          status: obj.status,
          role: obj.role.name,
          createdAt: new Date(obj.createdAt).toDateString(),
        });

        counter++;
      }
      var excelFileName = `UserDetails`;
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet(excelFileName);

      worksheet.columns = [
        { header: "Serial No.", key: "counter", width: 10 },
        { header: "Name", key: "fullName", width: 15 },
        { header: "Role", key: "role", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Dial Code", key: "dialCode", width: 10 },
        { header: "Mobile No", key: "mobileNo", width: 20 },
        // { header: 'Address', key: 'address', width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Creation Date", key: "createdAt", width: 17 },
      ];

      // Add Array Rows
      worksheet.addRows(UserData);

      // Add autofilter on each column
      worksheet.autoFilter = "A1:H1";

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + excelFileName + ".xlsx"
      );

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  verifyUser: async (req, res) => {
    try {
      let id = req.query.id;
      if (!id || typeof id == undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Id is required" },
        });
      }
      const user = await Users.findById({ _id: id });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.INVALID_ID },
        });
      }

      if (user) {
        const updatedUser = await Users.updateOne(
          { _id: id },
          { isVerified: "Y" }
        );
        if (req.query.role === "company") {
          return res.redirect(
            `${process.env.FRONT_WEB_URL}/organization?id=${id}`
          );
        } else {
          return res.redirect(`${process.env.FRONT_WEB_URL}/?id=${id}`);
        }
      }
    } catch (err) {
      return res.status(400).json({ success: true, code: 400, error: err });
    }
  },

  checkEmail: async function (req, res) {
    var email = req.query.email;
    if (!email || typeof email == undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
      });
    }
    const user = await Users.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (user) {
      return res.status(200).json({
        success: false,
        error: { code: 400, message: constants.onBoarding.EMAIL_TAKEN },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: constants.onBoarding.EMAIL_AVAILABLE,
      });
    }
  },

  resendVerifcationEmail: async (req, res) => {
    try {
      let { email } = req.query;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Email required" },
        });
      } else {
        let user = await Users.findOne({
          email: email,
          isDeleted: false,
          isVerified: "N",
        });

        if (user) {
          let emailPayload = {
            email: user.email,
            fullName: user.fullName,
            id: user.id,
          };
          await Emails.userVerifyLink(emailPayload);

          return res.status(200).json({
            success: true,
            message: "Verify link  sent to your registered email.",
          });
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: "User not exist or email alredy verified",
            },
          });
        }
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  inviteUser: async (req, res) => {
    var date = new Date();
    try {
      const data = req.body;

      if (!req.body.email || !req.body.fullName) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      let query = {};
      query.isDeleted = false;
      query.email = req.body.email.toLowerCase();
      var user = await Users.findOne(query);
      // let role = req.body.role ;

      if (user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.EMAIL_EXIST,
          },
        });
      } else {
        data["date_registered"] = date;
        data["createdAt"] = date;
        data["updatedAt"] = date;
        data["status"] = "active";
        data["role"] = req.body.role;
        data["type"] = req.body.type;
        data["addedBy"] = req.identity.id;
        var password = req.body.password;
        if (req.body.password) {
          data.password = await bcrypt.hashSync(
            req.body.password,
            bcrypt.genSaltSync(10)
          );
        } else {
          password = await generatePassword();
          data.password = await bcrypt.hashSync(
            password,
            bcrypt.genSaltSync(10)
          );
        }

        data.isVerified = "Y";
        data.email = data.email.toLowerCase();

        // if (req.body.firstName && req.body.lastName) {
        //   data["fullName"] = req.body.firstName + " " + req.body.lastName;
        // }
        data.addedBy = req.identity.id;
        // Create a user
        const user = new Users(data);

        // Save user in the database
        const newUser = await user.save(user);

        let email_payload = {
          email: newUser.email,
          fullName: newUser.fullName,
          password: password,
          role:newUser.role,
          id:newUser.id
        };
        await Emails.invite_user_email(email_payload);

        return res.status(200).json({
          success: true,
          data: newUser,
          message: constants.onBoarding.USER_INVITED,
        });
      }
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, code: 400, message: "" + err });
    }
  },

  //   try {
  //     var data = req.body;
  //     const accessToken = data.accessToken;
  //     if(accessToken){
  //       return res.status(400).json({
  //         success:false,
  //         error : {code:400,message:"Authentication required"}
  //       })
  //     }
  //     var query = {};
  //     if (data.facebookId) {
  //       query.facebookId = data.facebookId;
  //       data.facebookConnected = true;
  //     } else if (data.googleId) {
  //       query.googleId = data.googleId;
  //       data.gmailConnected = true;
  //     } else if (data.appleId) {
  //       query.appleId = data.appleId;
  //       data.appleConnected = true;
  //     } else {
  //       return res.status(400).json({
  //         success: false,
  //         error: { message: "one social media is required" },
  //       });
  //     }
  //     if (data.email) {
  //       //when user log in from gmail in payload we get googleId
  //       query = {};
  //       query.email = data.email;
  //       delete query.googleId;
  //       query.googleId = "";
  //       query.isDeleted = false;
  //       var userExist = await Users.findOne(query);
  //       if (userExist) {
  //         return res.status(400).json({
  //           success: false,
  //           error: { code: 400, message: constants.user.userExist },
  //         });
  //       } else {
  //         query.googleId = data.googleId;
  //         delete query.email;
  //       }
  //     }
  //     // console.log(query,'query');
  //     Users.findOne(query).then(async (user) => {
  //       // console.log(user,'user');
  //       if (user && user.status == "deactive") {
  //         return res.status(400).json({
  //           success: false,
  //           error: { code: 400, message: constants.user.USERNAME_INACTIVE },
  //         });
  //       }

  //       if (data.facebookId && user && user.facebookConnected == false) {
  //         return res.status(400).json({
  //           success: false,
  //           error: { code: 400, message: constants.user.FACEBOOK_DISCONNECTED },
  //         });
  //       }

  //       if (user && data.googleId && user.googleId == false) {
  //         return res.status(400).json({
  //           success: false,
  //           error: { code: 400, message: constants.user.GMAIL_DISCONNECTED },
  //         });
  //       }

  //       if (user != undefined) {
  //         var token = jwt.sign(
  //           {
  //             user_id: user.id,
  //             firstName: user.firstName,
  //           },
  //           {
  //             issuer: "Jcsoftware",
  //             subject: user.email,
  //             audience: "grow and help",
  //           }
  //         );
  //         const refresh_token = jwt.sign(
  //           { user_id: user.id },
  //           { issuer: "refresh", subject: "user", audience: "grow and help" }
  //         );

  //         delete user.password;

  //         user.access_token = token;

  //         user.refreshToken = refresh_token;

  //         if (data.push_token) {
  //           var updtedUser = await Users.update({
  //             id: user.id,
  //             push_token: data.push_token,
  //             isVerified: "Y",
  //             status: "active",
  //             updatedAt: new Date(),
  //           });
  //         }
  //         return res.status(200).json({
  //           success: true,
  //           code: "200",
  //           message: constants.user.SUCCESSFULLY_LOGGEDIN,
  //           data: user,
  //         });
  //       } else {
  //         (data.isVerified = "Y"),
  //           (data.status = "active"),
  //           (data.createdAt = new Date()),
  //           (data.updatedAt = new Date()),
  //           await Users.create(data)
  //             .fetch()
  //             .then(async (user) => {
  //               var token = jwt.sign(
  //                 { user_id: user.id, firstName: user.firstName },
  //                 {
  //                   issuer: "Jcsoftware",
  //                   subject: user.email,
  //                   audience: "grow and help",
  //                 }
  //               );
  //               const refreshToken = jwt.sign(
  //                 { user_id: user.id },
  //                 {
  //                   issuer: "refresh",
  //                   subject: "user",
  //                   audience: "grow and help",
  //                 }
  //               );
  //               delete user.password;
  //               user.access_token = token;
  //               user.refresh_token = refreshToken;

  //               return res.status(200).json({
  //                 success: true,
  //                 code: 200,
  //                 message: constants.user.SUCCESSFULLY_LOGGEDIN,
  //                 data: user,
  //               });
  //             });
  //       }
  //     });
  //   } catch (error) {
  //     // console.log(error, "error");
  //     return res.status(400).json({
  //       success: false,
  //       error: { code: 400, message: "" + error },
  //     });
  //   }
  // },
  logInSignUpSocialMedia: async (req, res) => {
    
    if (!req.body.email || typeof req.body.email == undefined) {
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 400, message: constants.onBoarding.EMAIL_REQUIRED },
        });
    }
    let userData = req.body;
    // //(userData);
    var query = {};
    query.email = userData.email;
    query.isDeleted = false;
    let user = await Users.findOne(query);

    if (user != undefined) {
      if (user.isVerified == "N") {
        return res
          .status(404)
          .json({
            success: false,
            error: {
              code: 400,
              message: constants.onBoarding.USERNAME_VERIFIED,
            },
          });
      }
      var token = jwt.sign(
        { id: user.id, fullName: user.fullName },
        process.env.JWT_SECRET,
        {
          expiresIn: "200h",
        }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "200h",
        }

      );
      var userInfo;
      userInfo = Object.assign({}, user._doc);
      userInfo.alreadyRegistered = true;
      userInfo.role = user.role
      userInfo.access_token = token;
      userInfo.refresh_token = refreshToken;

      return res.status(200).json({
        success: true,
        message: constants.onBoarding.LOGIN_SUCCESS,
        data: userInfo,
      });
    } else {
      let data = req.body;
      data.email = data.email.toLowerCase();
      var date = new Date();
      // data["roles"] = "user";
      data["date_registered"] = date;
      data["date_verified"] = date;
      data["status"] = "active";
      data["mobileNo"] = data.mobileNo ? data.mobileNo : "";
      data["domain"] = "web";

      data["isVerified"] = "Y";
      // data["socialimage"] = data.image;
      data["image"] = data.image;

      data["firstName"] = data.firstName;
      data["lastName"] = data.lastName;
      data["fullName"] = data.firstName + " " + data.lastName;

      var query = {};
      query.email = data.email;
      query.isDeleted = false;

      var email = data.email;
      if (data.email == "" || data.email == undefined) {
        throw "Email Id is missing";
      }
      data.password = generatePassword();
      delete data["id"];

      //(data, "data");
      var userRegistered = await Users.create(data);
      if(userRegistered.firstName && userRegistered.lastName  ){
        userRegistered.fullName = userRegistered.firstName + " " + userRegistered.lastName
      }
      var token = jwt.sign(
        { id: userRegistered._id, fullName: userRegistered.fullName },
        process.env.JWT_SECRET,
        {
          expiresIn: "200h",
        }
      );
      const refreshToken = jwt.sign(
        { id: userRegistered._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "200h",
        }

      );
      let userInfo;
      userInfo = Object.assign({}, userRegistered._doc);

      userInfo.alreadyRegistered = false;
      userInfo.access_token = token;
      userInfo.role = ""

      //.log(userRegistered, "===================query");

      return res.status(200).json({
        success: true,
        message: constants.onBoarding.SUCCESSFULLY_REGISTERED,
        data: userInfo,
      });
    }
  },

  googleLoginAuthentication: async (req, res) => {
    try {
      let oAuth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: req.header("Referer")
          ? req.header("Referer") + "company"
          : process.env.GOOGLE_LOGIN_REDIRECT,
      });
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
        prompt: "consent",
      });
      return res.status(200).json({
        success: true,
        data: authUrl,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },

  googleLogin: async (req, res) => {
    try {
      let oAuth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: req.header("Referer")
          ? req.header("Referer") + "company"
          : process.env.GOOGLE_LOGIN_REDIRECT,
      });
      const { tokens } = await oAuth2Client.getToken(req.query.authCode);
      const accessToken = tokens.access_token;
      // Set the access token obtained from the authorization step
      let oauth2Client = new google.auth.OAuth2(); // create new auth client
      oauth2Client.setCredentials({ access_token: accessToken }); // use the new auth client with the access_token
      let oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
      });

      let { data } = await oauth2.userinfo.get();
      let userQuery = {};
      userQuery.isDeleted = false;
      userQuery.$or = [
        { googleLoginId: { $regex: data.id, $options: "i" } },
        { email: { $regex: data.email, $options: "i" } },
        // Add more fields as needed
      ];

      let user = await db.users
        .findOne(userQuery)
        .populate("role")
        .populate("subRole");

      if (user) {
        const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "3000h",
          }
        );
        var userdata;
        userdata = Object.assign({}, user._doc);
        userdata["access_token"] = token;
        const updatedUser = await db.users.updateOne(
          { _id: userdata.id },
          { lastLogin: new Date() }
        );
        return res.status(200).json({
          success: true,
          message: constants.onBoarding.LOGIN_SUCCESS,
          data: userdata,
        });
      } else {
        let newUser = {};
        const date = new Date();
        newUser["status"] = "active";
        newUser["role"] = "64b15102b14de6c28838f7d2";
        newUser.firstName = data.given_name;
        newUser.lastName = data.family_name;
        if (data.name) {
          newUser.fullName = data.name;
        }
        const password = data.id;
        newUser.password = await bcrypt.hashSync(
          password,
          bcrypt.genSaltSync(10)
        );
        newUser.isVerified = "Y";
        newUser.createdAt = new Date();
        newUser.updatedAt = new Date();
        newUser.isDeleted = false;
        newUser.email = data.email.toLowerCase();
        newUser.googleLoginId = data.id;

        let createdUser = await db.users.create(newUser);
        var registeredUser = await Users.findById(
          createdUser.id ? createdUser.id : createdUser._id
        )
          .populate("role")
          .populate("subRole");
        const token = jwt.sign(
          { id: registeredUser.id, role: registeredUser.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "3000h",
          }
        );
        var userdata;
        userdata = Object.assign({}, registeredUser._doc);
        userdata["access_token"] = token;
        userdata["social_login"] = true;
        const updatedUser = await db.users.updateOne(
          { _id: userdata.id },
          { lastLogin: new Date() }
        );
        return res.status(200).json({
          success: true,
          message: constants.onBoarding.LOGIN_SUCCESS,
          data: userdata,
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },
};

// async function dataUpdateOnLogin(options) {
//   const updatedUser = await db.users.updateOne(
//     { _id: options.id },
//     { lastLogin: new Date() }
//   );
//   let userData = await db.users.findById(options.id)
//   if (userData) {
//     let cacheData = userData
//     const role = await db.roles.findById(userData.role)
//     cacheData.role = role
//     cacheData.roleId = userData.role

//     if (userData.subRole) {
//       let subRole = await db.UserRoles.findById(userData.subRole)
//       cacheData.subRole = subRole

//     }

//   }
// }

// async function updateLastLogin(user) {
//   let activeCusetomerQuery = {}
//   activeCusetomerQuery.user_id = user.id
//   let { startDate, endDate } = getStartAndEndDate()
//   activeCusetomerQuery.createdAt = { $gte: startDate, $lte: endDate }
//   let alreadyActiveInCurrentMonth = await db.activecustomers.findOne(activeCusetomerQuery)
//   if (!alreadyActiveInCurrentMonth) { await db.activecustomers.create({ user_id: user.id }) }

//   const { startOfLastMonth, endOfLastMonth } = await getStartAndEndDateOfPreviousMonth()
//   let previousMonthActiveCheckQuery = {}
//   previousMonthActiveCheckQuery.user_id = user.id
//   previousMonthActiveCheckQuery.createdAt = { $gte: startOfLastMonth, $lte: endOfLastMonth }
//   let activeInPreviousMonth = await db.activecustomers.findOne(previousMonthActiveCheckQuery)
//   if (!activeInPreviousMonth) {
//     let existedInreactive = await db.reactivatedcustomers.findOne(previousMonthActiveCheckQuery)
//     if (!existedInreactive) {
//       let reactivatedCustomer = await db.reactivatedcustomers.create({ user_id: user.id })
//     }

//   }
// }

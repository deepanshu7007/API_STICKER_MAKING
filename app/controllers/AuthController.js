"use strict";

const db = require("../models");
const Users = db.users;
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../utls/constants");
// const reader = require('xlsx');

function generateProductCode() {
  // action are perform to generate VeificationCode for user
  var length = 7;
  var charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";
  var retVal = "";

  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  return retVal;
}
module.exports = {
  /**
   * Genereating Access token
   */

  getAccessToken: async (req, res) => {
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
            expiresIn: "10h",
          }
        );

        return res.status(200).json({
          success: true,
          access_token: token,
          message: constants.onBoarding.TOKEN_VALID,
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },
};

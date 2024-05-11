var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      firstName: String,
      lastName: String,
      fullName: String,
      email: String,
      password: String,
      verificationCode: String,
      dialCode: String,
      mobileNo: String,
      image: String,
      address: String,
      city: String,
      state: String,
      country: String,
      pinCode: String,
      customer_id: String,
      company: String,
      goal: String,
      remote: String,
      locationId: String, //Review location id
      department: { type: Schema.Types.ObjectId, ref: "department" },
      isVerified: {
        type: String,
        default: "Y",
      },
      stripe_price_id: String,
      role: {
        type: String,
        enum: ["user", "admin","subAdmin"],
      },
      type: {
        type: String,
        enum: ["freelancer", "job_seeker", "employer", "new_talent"],
      },
      status: {
        type: String,
        default: "deactive",
      },

      addedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },

      isDeleted: {
        type: Boolean,
        default: false,
      },
      lastLogin: Date,
      createdAt: Date,
      updatedAt: Date,

      stripe_subscriptionId: String,
      // trial_ended: { type: Boolean, default: false },

      // on_trial: { type: Boolean, default: false }, // if plan is on it's trial period
      validUpTo: { type: Date, select: false }, // used for trial period

      planId: {
        type: Schema.Types.ObjectId,
        ref: "plan",
      },

      subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: "subscriptions",
      },
      // social login keys
      facebookId: {
        type: "string",
      },
      googleId: {
        type: "string",
      },
      appleId: {
        type: "string",
      },
      dateOfBirth:{type: Date},
      facebookConnected: { type: "boolean", defaultsTo: false },
      gmailConnected: { type: "boolean", defaultsTo: false },
      appleConnected: { type: "boolean", defaultsTo: false },
      //                            till here
      preferName: String,
      jobTitle: String,
      customJobTitle: String,
      seniorityLevel: String,
      alreadyRegistered : {type:"boolean",default : false}
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Users = mongoose.model("users", schema);
  return Users;
};

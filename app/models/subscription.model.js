var Mongoose = require('mongoose'),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      planType: String,
      planInterval: Number,
      amount: Number,
      isDeleted: { type: Boolean, default: false },
      validUpTo: Date,
      createdAt: Date,
      updatedAt: Date,
      status: { type: String, default: 'active' },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
      planId: {
        type: Schema.Types.ObjectId,
        ref: 'plan',
      },
      type:String,
      subscription: Object,
      subscriptionId:String,
      stripe_price_id: String,
      trial_period_days: Number,
      on_trial: { type: Boolean, default: false },       // if plan is on it's trial period

    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Subscription = mongoose.model('subscription', schema);
  return Subscription;
};

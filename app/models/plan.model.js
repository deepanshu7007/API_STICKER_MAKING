var Mongoose = require('mongoose'),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: String,
      // price: { type: Number, defaultsTo: 0 },
      status: { type: String, default: 'active' },
      order: Number,
      feature: Object,
      status: { type: String, default: 'active' },
      isDeleted: { type: Boolean, default: false },
      monthlyPrice: Object,
      threeMonthPrice: Object,
      sixMonthPrice: Object,
      yearlyPrice: Object,
      
      
      recommended: String,
      createdAt: Date,
      updatedAt: Date,
      stripe_product_id: String,
      pricing: Array,
  
      trial_period_days: Number,
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Plan = mongoose.model('plan', schema);
  return Plan;
};

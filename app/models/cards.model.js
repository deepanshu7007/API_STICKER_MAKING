var Mongoose = require('mongoose'),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      card_id: String,
      last4: String,
      exp_month: String,
      exp_year: String,
      brand: String,
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
      isDefault: { type: Boolean, default: false },
      isDeleted: { type: Boolean, default: false },
      createdAt: Date,
      updatedAt: Date,
      status: { type: String, default: 'active' },
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Cards = mongoose.model('cards', schema);
  return Cards;
};

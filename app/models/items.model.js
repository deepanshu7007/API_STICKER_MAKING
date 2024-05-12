// const { number } = require('joi');

var Mongoose = require('mongoose');
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      itemName:{type:String},
      barcode:{type:String},
      model:{type:String},
      price:{type:String},
      size:{type:Number},
      size_type:{type:String},
      status: { type: String, default: 'active' },
      isDeleted: { type: Boolean, default: false },
      createdAt: Date,
      updatedAt: Date,
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Items = mongoose.model('items', schema);
  return Items;
};

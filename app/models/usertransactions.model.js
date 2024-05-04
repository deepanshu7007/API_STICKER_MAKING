var Mongoose = require('mongoose'),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
    
        amount:Number,
        type:String,
        status:String,
      user_id: { type: Schema.Types.ObjectId, ref: 'users' },
      isDeleted: { type: Boolean, default: false },
      createdAt: Date,
      updatedAt: Date
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const usertransactions = mongoose.model('usertransactions', schema);
  return usertransactions;
};

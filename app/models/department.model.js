var Mongoose = require('mongoose'),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: String,
      status: { type: String, default: 'active' },
      isDeleted: { type: Boolean, default: false },
      createdAt: Date,
      updatedAt: Date,
      addedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  )

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Department = mongoose.model('department', schema);
  return Department;
};

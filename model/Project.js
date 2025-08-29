const mongoose = require('mongoose');
const Counter = require('./counter');

const schema = mongoose.Schema({
    projectId : Number,
    communityId : Number,
    pName : String,
    pDescription : String,
    images : [String],
    verifiedBy : Number
});

schema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "projectId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Project", schema, "projects");
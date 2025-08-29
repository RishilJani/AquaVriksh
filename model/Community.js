const mongoose = require('mongoose');
const Counter = require('./counter');

const schema = mongoose.Schema({
    communityId : Number,
    cName : String,
    userName : String,
    cEmail : String,
    cPhone : String,
    cPassword : String,
    noOfMembers : Number,
    noOfProjects : Number,
    IFSC: String,
    UPIid : String,
    verifiedBy : Number
});

schema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "communityId" }, 
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Community", schema, "communities");
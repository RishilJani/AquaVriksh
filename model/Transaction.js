const mongoose = require('mongoose');
const Counter = require("./counter");

const schema = mongoose.Schema({
    transactionId : Number,
    userId : Number,
    communityId : Number,
    projectId : Number,
    amount : Number,
    dateTime : String
});


schema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "transactionId" },           
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Transaction", schema, "transactions");
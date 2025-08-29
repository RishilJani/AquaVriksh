const mongoose = require('mongoose');
const Counter = require("./counter.js");

const schema = mongoose.Schema({
    userId : Number,
    userName : String,
    userEmail : String,
    userPhone : String,
    userPassword : String
});

schema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("User", schema, "users");
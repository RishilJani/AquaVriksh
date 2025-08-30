const mongoose = require('mongoose');
const Counter = require("./counter.js");

const schema = mongoose.Schema({
  imageId : Number,
  imageURL : String,
  userId : Number,
  isApproved : Boolean,
  date : String,
});

schema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "imageId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.imageId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Image", schema, "images");
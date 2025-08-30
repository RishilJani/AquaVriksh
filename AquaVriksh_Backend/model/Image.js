const mongoose = require('mongoose');
const Counter = require("./counter.js");

const schema = mongoose.Schema({
  imageId : Number,
  imageURL : String,
  userId : Number,
  isApproved : Boolean, // true : verified, false : rejected , null : pending
  date : String,
  pointsEarned : {
    type : Number,
    default : 0
  },

  // Location Information
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  }

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
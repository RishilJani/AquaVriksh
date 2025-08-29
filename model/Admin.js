const mongoose = require('mongoose');
import Counter from './counter';

const schema = mongoose.Schema({
    adminID : Number,
    adminName : String,
    adminEmail : String,
    adminPassword : String
});

schema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "adminID" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Admin", schema, "admins");
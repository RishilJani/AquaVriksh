import { Schema, model } from 'mongoose';
import Counter from './counter';

const schema = Schema({
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

export default model("Admin", schema, "admins");
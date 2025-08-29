import { Schema, model } from 'mongoose';
import Counter from "./counter.js";

const schema = Schema({
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

export default model("User", schema, "users");
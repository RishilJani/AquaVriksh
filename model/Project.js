import { Schema, model } from 'mongoose';
import Counter from './counter';

const schema = Schema({
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

export default model("Project", schema, "projects");
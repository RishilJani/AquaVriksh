const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "userId", "postId"
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model("Counter", counterSchema);

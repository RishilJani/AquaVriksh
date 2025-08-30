const mongoose = require('mongoose');
const Counter = require("./counter.js");

const schema = mongoose.Schema({
    badgeId: Number,
    badgeName: String,
    imageUrl: String,       
    badgeDescription: String,
    badgeThreshold: Number
});

schema.pre("save", async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { id: "badgeId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.badgeId = counter.seq;
    }
    next();
});

module.exports = mongoose.model("Badge", schema, "badges");
const express = require("express");
const Badge = require("../model/Badge");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const badges = await Badge.find();
        res.json(badges);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const badge = await Badge.findOne({ badgeId: req.params.id });
        if (!badge) return res.status(404).json({ error: "Badge not found" });
        res.json(badge);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const badge = new Badge(req.body);
        await badge.save();
        res.json({ message: "Badge created", badge });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// router.put("/:id", async (req, res) => {
//     try {
//         const image = await Image.findOneAndUpdate(
//             { userID: req.params.id },
//             req.body,
//             { new: true }
//         );
//         if (!image) return res.status(404).json({ error: "Image not found" });
//         res.json({ message: "Image updated", image });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

router.delete("/:id", async (req, res) => {
    try {
        const badge = await Badge.findOneAndDelete({ badgeId: req.params.id });
        if (!badge) return res.status(404).json({ error: "Badge not found" });
        res.json({ message: "Badge deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

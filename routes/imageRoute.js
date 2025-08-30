const express = require("express");
const Image = require("../model/Image");
const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const images = await Image.find({ userId: req.params.id })  ;
        if (!images) return res.status(404).json({ error: "Images not found" });

        res.json(images);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const image = new Image(req.body);
        await image.save();
        res.json({ message: "Image created", image });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});




module.exports = router;
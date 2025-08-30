const express = require("express");
const Image = require("../model/Image");
const User = require("../model/User");
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

router.post("/:id", async (req, res) => {
    try {
        const user = await User({userId : req.params.id});
        const image = new Image({
            imageURL : req.body.link,
            userId : req.params.id,
            isApproved : true,
            date: "30/08/2025",
            pointsEarned : 7,
            location : {
                latitude : 23.039181 ,
                longitude: 72.571290
            }
        });
        await image.save();
        res.json({ message: "Image created", image });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});



module.exports = router;
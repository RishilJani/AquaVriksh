const express = require("express");
const moment = require('moment');
const Image = require("../model/Image");
const User = require("../model/User");
const Badge = require("../model/Badge");
const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const images = await Image.find({ userId: req.params.id });
        if (!images) return res.status(404).json({ error: "Images not found" });

        res.json(images);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/:id", async (req, res) => {
    try {
        // const user = await User.findOne({ userId: req.params.id });
        var fomratted = moment().format("YYYY-MM-DD HH:mm:ss")
        const image = new Image({
            imageURL: req.body.link,
            userId: req.params.id,
            isApproved: null,
            date: fomratted,
            pointsEarned: 0,
            location: {
                latitude: req.body.latitude,
                longitude: req.body.longitude
            }
        });
        await image.save();


        await AI_Check(image, req.params.id);
        
        res.json({ message: "Image created", image });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

async function AI_Check(image, id,) {

    console.log("AI_Check Funciton.....");

    const response = await fetch('https://serverless.roboflow.com/infer/workflows/aquavriksh/detect-count-and-visualize-2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            api_key: 'w052qYFm5XkKz55xWUz0',
            inputs: {
                "image": { "type": "url", "value": image.imageURL }
            }
        })
    });

    const result = await response.json();

    console.log("result = ", result);
    console.log("prediction = ", result.outputs[0].predictions);

    var bad = ["cut stump", "excavator", "fallen tree", "pollutant slick", "trash", "trash pile", "truck"];
    var mypoints = [2, 5, 1, 4, 2, 3, 1];
    var trees = ["mangrove tree", "normal tree"];

    try {
        let flag = false;

        for (var obj of result.outputs[0].predictions.predictions) {
            if (trees.includes(obj.class)) {
                flag = true;
            }
        }
        if (flag) {
            let max = -1, confidence = 0;
            for (var obj of result.outputs[0].predictions.predictions) {
                let temp = bad.indexOf(obj.class);
                // console.log("class = ", obj.class, " temp = " + temp);
                if (temp == -1) {
                    continue;
                }
                if (max == -1 || max < mypoints[temp]) {
                    max = mypoints[temp];
                    confidence = obj.confidence;
                }
            }
            image.pointsEarned += Math.round(max * confidence);

            console.log("\n\nTotal Points = ", image.pointsEarned);

            image.isApproved = true;
            const user = await User.findOneAndUpdate(
                { userId: id },
                { $inc: { points: image.pointsEarned } },
                { $push: { listOfImages: image.imageId } }
            );
            let badges = Badge.find();
                let li = [];
                for(var i of badges){
                    if(user.points >= i.badgeThreshold)
                            li.push(i.badgeId);
                }
                user.badges = li;
            await image.save();
            await user.save();
        }
        else {
            image.isApproved = false;
            try {
                console.log("Id = " , id);
                
                const user = await User.findOneAndUpdate(
                    { userId: id },
                    { $push: { listOfImages: image.imageId } }
                );
                
                await user.save();
            }catch(e){
                console.log("err = ",e);
            }
            
            await image.save();
        }
    } catch (err) {
        console.log("Err = ", err);

    }

    // result -> predictions [] -> 1-1 obj -> class = ''
}

module.exports = router;


/*
    if( true condition){
        const user = await User.findOneAndUpdate(
            {  userId: id },
            { $inc : {points : mypoints[0]}},
            { $push : {listOfImages : image.imageId}}
        
        );

        image.isApproved = true;
        await image.save();
    }
        
    */
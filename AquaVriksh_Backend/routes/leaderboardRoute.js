const express = require("express");
const Image = require("../model/Image");
const User = require("../model/User");
const Badge = require("../model/Badge");
const router = express.Router();

router.get("/:id",async (req, res) =>{
    var result = await User.aggregate([ { 
        $group: {
          _id: null,                
          totalRecords: { $sum: 1 }, 
          totalPoints: { $sum: "$points" }
        }
    }]);

    const totalUsers = result[0].totalRecords;
    const totalPoints = result[0].totalPoints;

    result = await Image.aggregate([ { $count : "totalImages"}]);
    const totalImages = result[0].totalImages;
    
    result = await User.find().sort({points : -1});
    const rank = result.findIndex((val, ind) =>{ 
        return val.userId == req.params.id;
    });

    [].splice(0,)
    res.json({message : "done" , "data" :  {
        totalUser : totalUsers,
        totalPoints : totalPoints,
        totalImages : totalImages,
        rank : rank+1,
        top10 : result.slice(0,10)
    }});
});

module.exports = router;

/*
top 10 users
current User rank
total contributors using aggrigation
total sum of points using aggrigation
total images count using aggrigation

*/
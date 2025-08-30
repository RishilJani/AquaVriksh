const express = require("express");
const Image = require("../model/Image");
const User = require("../model/User");
const Badge = require("../model/Badge");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const images = await Image.find({ userId: req.params.id });
    const user = await User.findOne({ userId: req.params.id });

    const badges = await Badge.find({ badgeId: { $in: user.badges } });

    console.log("images == ", images);
    console.log("user == ", user);
    console.log("badge == ", badges);

    var obj = {
      totalVerification: images.length,
      successRate: successRate(images),
      recenetVerifications: images,
      badges: badges,
      userDetails: user
    };

    res.json(obj);
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
});

async function successRate(img) {
  // const img = await  Image.find({userId : userId });
  console.log("Img === ", img);
  console.log("Size ==== ", img.length);
  const totalReport = img.length;
  if (totalReport == 0) { return 0; }
  const approvedReport = img.reduce((acc, cVal, cInd) => cVal.isApproved ? acc + 1 : acc + 0, 0);

  print("::::: Success Rate::::: ");
  return Math.round(approvedReport / totalReport);
}

module.exports = router;
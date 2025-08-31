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

    var obj = {
      totalVerification: images.length,
      successRate: successRate(images),
      allRecords: images,
      badges: badges,
      userDetails: user
    };

    res.json({"message": "done", "data": obj});
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
});

async function successRate(img) {
  
  const totalReport = img.length;
  if (totalReport == 0) { return 0; }
  const approvedReport = img.reduce((acc, cVal, cInd) => cVal.isApproved ? acc + 1 : acc + 0, 0);

  return Math.round(approvedReport / totalReport);
  
}

module.exports = router;
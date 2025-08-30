const express = require("express");
const Image = require("../model/Image");
const User = require("../model/User");
const router = express.Router();

router.get("/:id", (req,res)=>{

});

async function successRate (){
  const img = await  Image.find({userId : this.userId });
  console.log("Img === ", img);
  console.log("Size ==== ",img.length);
  const totalReport = img.length;
  
}

module.exports = router;
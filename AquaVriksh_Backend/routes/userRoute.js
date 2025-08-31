const express = require('express');
const bcrypt = require('bcryptjs');
const User = require("../model/User");
const Badge= require("../model/Badge");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const user = await User.find({ "userId": req.params.id });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/login", async (req,res) => {
    const em = req.body.email;
    var pass = await bcrypt.hash(req.body.password, 12);
    try{
        const us = await User.findOne({ email : email , pass : password});
        if(us){
            res.status(200).json({ "found" : true, "created" : false , "id" : us.userId});
        }else{
            res.status(404).json({"error" : "User not found"});
        }
    }catch(err){
        res.status(200).json({"found" : false ,"message" : "User not found"});
    }
});

router.post("/signup", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: "User created", "created" : true , "found" : false , "id" : user.userId});
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { userId: req.params.id },
            req.body,
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });

        const eligibleBadges = await Badge.find({
            badgeThreshold: { $lte: user.userPoints }
        });
        
        if(eligibleBadges != undefined){
            eligibleBadges.forEach(badge => {
                if(!user.listOfBadges.includes(badge.badgeId)){
                    user.listOfBadges.push(badge.badgeId);
                }
            });
            await user.save();
        }

        res.json({ message: "User updated", user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ "userId": req.params.id });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
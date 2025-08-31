// const mongoose = require('mongoose');
// const Counter = require("./counter.js");

// const schema = mongoose.Schema({
//   userId: Number,
//   userName: {
//     type
//   },
//   userEmail: String,
//   userPassword: String,
//   userPoints: Number,
//   listOfBadges: [Number],
//   numberOfReports: Number
// });

// schema.pre("save", async function (next) {
//   if (this.isNew) {
//     const counter = await Counter.findOneAndUpdate(
//       { id: "userId" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     this.userId = counter.seq;
//   }
//   next();
// });

// module.exports = mongoose.model("User", schema, "users");

// MongoDB User Schema for AquaVriksh Dashboard
// This schema defines the complete user structure with validation and methods

const mongoose = require('mongoose');
const Counter = require("./counter.js");
// const Image = require('./Image');
const bcrypt = require('bcryptjs');

// User Schema Definition
const userSchema = mongoose.Schema({
  userId : Number,
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  
  // Gamification & Points
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  
  
  // Badges & Achievements
  badges: [Number],

  // imageIds
  listOfImages : [Number],

  joinDate: {
    type: String,
    default: Date.now
  },
    
}, {
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true }
});

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add points
userSchema.methods.addPoints = function(points) {
  this.points += points;
  this.stats.totalPointsEarned += points;
  return this.save();
};


// Instance method to unlock badge
userSchema.methods.unlockBadge = function(badgeId) {
  const existingBadge = this.badges.find(badge => badge.badgeId.equals(badgeId));
  if (!existingBadge) {
    this.badges.push({ badgeId, unlockedAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to update streak
userSchema.methods.updateStreak = function(activityDate) {
  const today = new Date();
  const lastActivity = new Date(this.stats.lastActive);
  
  // Check if activity is consecutive
  const dayDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (dayDiff === 1) {
    // Consecutive day
    this.streak += 1;
  } else if (dayDiff > 1) {
    // Break in streak
    this.streak = 1;
  }
  // If dayDiff === 0, same day activity, keep current streak
  
  this.stats.lastActive = activityDate || today;
  return this.save();
};

module.exports = mongoose.model('User', userSchema, "users");
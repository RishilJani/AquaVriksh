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
const Image = require('./Image');
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

// Virtual for calculating level based on points
// userSchema.virtual('calculatedLevel').get(function() {
//   if (this.points >= 1500) return 'Mangrove Master';
//   if (this.points >= 1000) return 'Eco Warrior';
//   if (this.points >= 500) return 'Green Guardian';
//   return 'Seed Planter';
// });

// Virtual for calculating success rate
// userSchema.virtual('calculatedSuccessRate').get(async function() {
//   const img = await  Image.find({userId : this.userId });
//   console.log("Img === ", img);
//   console.log("Size ==== ",img.length);
//   const totalReport = img.length;
//   var verifiedReports = img.reduce((acc,cVal, cIndex ) => cVal.isApproved ? acc+1 : acc + 0,0);
//   if (totalProcessed === 0) return 0;
//   return Math.round((verifiedReports / totalReport) * 100);
// });

// // Virtual for next level progress
// userSchema.virtual('nextLevelProgress').get(function() {
//   const levelThresholds = {
//     'Seed Planter': 500,
//     'Green Guardian': 1000,
//     'Eco Warrior': 1500,
//     'Mangrove Master': Infinity
//   };
  
//   const currentThreshold = levelThresholds[this.level];
//   const nextThreshold = levelThresholds[this.calculatedLevel];
  
//   if (nextThreshold === Infinity) return 100;
  
//   const progress = ((this.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
//   return Math.max(0, Math.min(100, progress));
// });

// Pre-save middleware to hash password

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


// // Static method to get user rank
// userSchema.statics.getUserRank = function(userId) {
//   return this.findById(userId)
//     .then(user => {
//       if (!user) return null;
      
//       return this.countDocuments({
//         points: { $gt: user.points },
//         isActive: true
//       }).then(count => count + 1);
//     });
// };

// // Static method to update all user ranks
// userSchema.statics.updateAllRanks = function() {
//   return this.find({ isActive: true })
//     .sort({ points: -1 })
//     .then(users => {
//       const updatePromises = users.map((user, index) => {
//         user.rank = index + 1;
//         return user.save();
//       });
//       return Promise.all(updatePromises);
//     });
// };

// Indexes for optimal performance

userSchema.index({ points: -1 }); // For leaderboard queries
userSchema.index({ email: 1 }, { unique: true }); // For email lookups
userSchema.index({ username: 1 }, { unique: true }); // For username lookups
userSchema.index({ 'location.coordinates': '2dsphere' }); // For location-based queries
// userSchema.index({ 'stats.lastActive': -1 }); // For activity tracking
userSchema.index({ level: 1, points: -1 }); // For level-based queries
userSchema.index({ isActive: 1, points: -1 }); // For active user queries
userSchema.index({ 'badges.badgeId': 1 }); // For badge lookups
// userSchema.index({ 'achievements.achievementId': 1 }); // For achievement lookups

// Compound indexes
// userSchema.index({ isActive: 1, 'stats.totalVerifications': -1 }); // For contributor rankings
// userSchema.index({ isActive: 1, streak: -1 }); // For streak leaderboards

// Create and export the model

module.exports = mongoose.model('User', userSchema, "users");
// MongoDB User Schema for AquaVriksh Dashboard
// This schema defines the complete user structure with validation and methods

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema Definition
const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  
  avatar: {
    type: String,
    default: '👤',
    validate: {
      validator: function(v) {
        // Allow emoji or valid image URL
        return /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|https?:\/\/.+/.test(v);
      },
      message: 'Avatar must be an emoji or valid image URL'
    }
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Gamification & Points
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  
  level: {
    type: String,
    enum: {
      values: ['Seed Planter', 'Green Guardian', 'Eco Warrior', 'Mangrove Master'],
      message: 'Invalid level specified'
    },
    default: 'Seed Planter'
  },
  
  rank: {
    type: Number,
    default: 0,
    min: [0, 'Rank cannot be negative']
  },
  
  streak: {
    type: Number,
    default: 0,
    min: [0, 'Streak cannot be negative']
  },
  
  // Location Information
  location: {
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country name cannot exceed 50 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  
  // Badges & Achievements
  badges: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative']
    }
  }],
  

  
  // Statistics
  stats: {
    totalVerifications: {
      type: Number,
      default: 0,
      min: [0, 'Total verifications cannot be negative']
    },
    verifiedReports: {
      type: Number,
      default: 0,
      min: [0, 'Verified reports cannot be negative']
    },
    rejectedReports: {
      type: Number,
      default: 0,
      min: [0, 'Rejected reports cannot be negative']
    },
    pendingReports: {
      type: Number,
      default: 0,
      min: [0, 'Pending reports cannot be negative']
    },
    successRate: {
      type: Number,
      default: 0,
      min: [0, 'Success rate cannot be negative'],
      max: [100, 'Success rate cannot exceed 100']
    },
    totalPointsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Total points earned cannot be negative']
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true }
});

// Virtual for calculating level based on points
userSchema.virtual('calculatedLevel').get(function() {
  if (this.points >= 1500) return 'Mangrove Master';
  if (this.points >= 1000) return 'Eco Warrior';
  if (this.points >= 500) return 'Green Guardian';
  return 'Seed Planter';
});

// Virtual for calculating success rate
userSchema.virtual('calculatedSuccessRate').get(function() {
  const totalProcessed = this.stats.verifiedReports + this.stats.rejectedReports;
  if (totalProcessed === 0) return 0;
  return Math.round((this.stats.verifiedReports / totalProcessed) * 100);
});

// Virtual for next level progress
userSchema.virtual('nextLevelProgress').get(function() {
  const levelThresholds = {
    'Seed Planter': 500,
    'Green Guardian': 1000,
    'Eco Warrior': 1500,
    'Mangrove Master': Infinity
  };
  
  const currentThreshold = levelThresholds[this.level];
  const nextThreshold = levelThresholds[this.calculatedLevel];
  
  if (nextThreshold === Infinity) return 100;
  
  const progress = ((this.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.max(0, Math.min(100, progress));
});

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

// Pre-save middleware to update level and stats
userSchema.pre('save', function(next) {
  // Update level based on points
  this.level = this.calculatedLevel;
  
  // Update success rate
  this.stats.successRate = this.calculatedSuccessRate;
  
  // Update last active timestamp
  this.stats.lastActive = new Date();
  
  next();
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

// Instance method to update verification stats
userSchema.methods.updateVerificationStats = function(status) {
  this.stats.totalVerifications += 1;
  
  switch (status) {
    case 'verified':
      this.stats.verifiedReports += 1;
      break;
    case 'rejected':
      this.stats.rejectedReports += 1;
      break;
    case 'pending':
      this.stats.pendingReports += 1;
      break;
  }
  
  // Update success rate
  this.stats.successRate = this.calculatedSuccessRate;
  
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

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function(limit = 10, period = 'all_time') {
  const query = { isActive: true };
  
  // Add period filtering if needed
  if (period !== 'all_time') {
    const startDate = new Date();
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    query['stats.lastActive'] = { $gte: startDate };
  }
  
  return this.find(query)
    .select('username name avatar points level rank streak stats.verifiedReports')
    .sort({ points: -1, 'stats.lastActive': -1 })
    .limit(limit);
};

// Static method to get user rank
userSchema.statics.getUserRank = function(userId) {
  return this.findById(userId)
    .then(user => {
      if (!user) return null;
      
      return this.countDocuments({
        points: { $gt: user.points },
        isActive: true
      }).then(count => count + 1);
    });
};

// Static method to update all user ranks
userSchema.statics.updateAllRanks = function() {
  return this.find({ isActive: true })
    .sort({ points: -1 })
    .then(users => {
      const updatePromises = users.map((user, index) => {
        user.rank = index + 1;
        return user.save();
      });
      return Promise.all(updatePromises);
    });
};

// Indexes for optimal performance
userSchema.index({ points: -1 }); // For leaderboard queries
userSchema.index({ email: 1 }, { unique: true }); // For email lookups
userSchema.index({ username: 1 }, { unique: true }); // For username lookups
userSchema.index({ 'location.coordinates': '2dsphere' }); // For location-based queries
userSchema.index({ 'stats.lastActive': -1 }); // For activity tracking
userSchema.index({ level: 1, points: -1 }); // For level-based queries
userSchema.index({ isActive: 1, points: -1 }); // For active user queries
userSchema.index({ 'badges.badgeId': 1 }); // For badge lookups

// Compound indexes
userSchema.index({ isActive: 1, 'stats.totalVerifications': -1 }); // For contributor rankings
userSchema.index({ isActive: 1, streak: -1 }); // For streak leaderboards

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;

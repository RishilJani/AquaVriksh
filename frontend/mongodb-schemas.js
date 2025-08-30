// MongoDB Schemas for AquaVriksh Dashboard
// This file contains all the database schemas needed for the dashboard functionality

// 1. User Schema
const userSchema = {
  _id: ObjectId,
  username: String,
  email: String,
  name: String,
  avatar: String, // emoji or image URL
  points: Number,
  level: {
    type: String,
    enum: ['Seed Planter', 'Green Guardian', 'Eco Warrior', 'Mangrove Master'],
    default: 'Seed Planter'
  },
  rank: Number,
  streak: Number,
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  badges: [{
    badgeId: ObjectId,
    unlockedAt: Date,
    progress: Number // for badges with progress tracking
  }],
  achievements: [{
    achievementId: ObjectId,
    unlockedAt: Date,
    progress: Number
  }],
  rewards: [{
    rewardId: ObjectId,
    unlockedAt: Date
  }],
  stats: {
    totalVerifications: Number,
    verifiedReports: Number,
    rejectedReports: Number,
    pendingReports: Number,
    successRate: Number,
    totalPointsEarned: Number,
    joinDate: Date,
    lastActive: Date
  },
  createdAt: Date,
  updatedAt: Date
};

// 2. Verification Schema (User Submissions)
const verificationSchema = {
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  imageUrl: String, // stored image URL
  imageData: String, // base64 image data (optional)
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['Mangrove Trees', 'Coastal Vegetation', 'Seagrass Meadows', 'Tidal Marsh', 'Wetland Area', 'Beach Cleanup', 'Restoration Work'],
    required: true
  },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  captureMode: {
    type: String,
    enum: ['environment', 'selfie'],
    default: 'environment'
  },
  aiAnalysis: {
    confidence: Number, // 0-100
    feedback: String,
    verifiedAt: Date,
    aiModel: String
  },
  points: {
    awarded: Number,
    deducted: Number,
    total: Number
  },
  submittedAt: Date,
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
};

// 3. Badge Schema
const badgeSchema = {
  _id: ObjectId,
  name: String,
  icon: String, // emoji
  description: String,
  requirement: String,
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: Number,
  requirements: {
    type: {
      type: String,
      enum: ['points', 'verifications', 'streak', 'accuracy', 'countries', 'ranking'],
      required: true
    },
    value: Number,
    condition: String // e.g., ">= 500 points", ">= 100 verifications"
  },
  color: String, // CSS color classes
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: Date
};

// 4. Achievement Schema
const achievementSchema = {
  _id: ObjectId,
  name: String,
  description: String,
  icon: String, // emoji
  reward: String, // e.g., "+25 points"
  requirements: {
    type: {
      type: String,
      enum: ['weekly_contributions', 'consecutive_days', 'accuracy_rate', 'total_verifications'],
      required: true
    },
    value: Number,
    condition: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: Date
};

// 5. Reward Schema
const rewardSchema = {
  _id: ObjectId,
  name: String,
  description: String,
  icon: String, // emoji
  type: {
    type: String,
    enum: ['profile_badge', 'avatar_frame', 'early_access', 'partner_communication'],
    required: true
  },
  requirement: String, // e.g., "Eco Warrior badge", "Top 50 ranking"
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: Date
};

// 6. Global Stats Schema (for dashboard statistics)
const globalStatsSchema = {
  _id: ObjectId,
  totalVerifications: Number,
  activeContributors: Number,
  successRate: Number,
  pointsAwarded: Number,
  totalUsers: Number,
  totalReports: Number,
  activeStreaks: Number,
  lastUpdated: Date,
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  }
};

// 7. Leaderboard Cache Schema (for performance)
const leaderboardCacheSchema = {
  _id: ObjectId,
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'all_time'],
    default: 'all_time'
  },
  rankings: [{
    userId: ObjectId,
    rank: Number,
    points: Number,
    level: String,
    verifiedReports: Number,
    streak: Number,
    change: String // e.g., "+2", "-1"
  }],
  lastUpdated: Date,
  expiresAt: Date
};

// 8. User Activity Schema (for tracking streaks and activity)
const userActivitySchema = {
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  activities: [{
    type: {
      type: String,
      enum: ['verification_submitted', 'verification_verified', 'badge_unlocked', 'achievement_unlocked', 'points_earned'],
      required: true
    },
    details: {
      verificationId: ObjectId, // if applicable
      badgeId: ObjectId, // if applicable
      achievementId: ObjectId, // if applicable
      points: Number,
      description: String
    },
    timestamp: Date
  }],
  streakCount: Number,
  createdAt: Date
};

// 9. Location Cache Schema (for geocoding optimization)
const locationCacheSchema = {
  _id: ObjectId,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  address: {
    district: String,
    state: String,
    country: String,
    fullAddress: String
  },
  lastUsed: Date,
  usageCount: Number,
  createdAt: Date
};

// 10. System Settings Schema
const systemSettingsSchema = {
  _id: ObjectId,
  key: String,
  value: Mixed, // can be any type
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: Date,
  updatedBy: ObjectId
};

// Indexes for optimal performance
const indexes = {
  users: [
    { points: -1 }, // for leaderboard queries
    { "stats.totalVerifications": -1 },
    { email: 1 }, // unique
    { username: 1 }, // unique
    { "location.coordinates": "2dsphere" } // for location-based queries
  ],
  verifications: [
    { userId: 1 },
    { status: 1 },
    { submittedAt: -1 },
    { "location.coordinates": "2dsphere" },
    { category: 1 },
    { "aiAnalysis.confidence": -1 }
  ],
  badges: [
    { rarity: 1 },
    { isActive: 1 }
  ],
  achievements: [
    { isActive: 1 }
  ],
  rewards: [
    { isActive: 1 },
    { type: 1 }
  ],
  globalStats: [
    { period: 1 },
    { lastUpdated: -1 }
  ],
  leaderboardCache: [
    { period: 1 },
    { expiresAt: 1 }
  ],
  userActivity: [
    { userId: 1, date: -1 },
    { date: 1 }
  ],
  locationCache: [
    { "coordinates": "2dsphere" },
    { lastUsed: -1 }
  ]
};

// Example queries for the dashboard API
const dashboardQueries = {
  // Get all dashboard data in one query
  getDashboardData: (userId) => {
    return {
      pipeline: [
        // Get user data
        { $match: { _id: ObjectId(userId) } },
        
        // Lookup user's verifications
        {
          $lookup: {
            from: "verifications",
            localField: "_id",
            foreignField: "userId",
            as: "verifications"
          }
        },
        
        // Lookup user's badges
        {
          $lookup: {
            from: "badges",
            localField: "badges.badgeId",
            foreignField: "_id",
            as: "badgeDetails"
          }
        },
        
        // Lookup user's achievements
        {
          $lookup: {
            from: "achievements",
            localField: "achievements.achievementId",
            foreignField: "_id",
            as: "achievementDetails"
          }
        },
        
        // Get global stats
        {
          $lookup: {
            from: "globalStats",
            pipeline: [
              { $sort: { lastUpdated: -1 } },
              { $limit: 1 }
            ],
            as: "globalStats"
          }
        },
        
        // Get leaderboard data
        {
          $lookup: {
            from: "leaderboardCache",
            pipeline: [
              { $match: { period: "all_time" } },
              { $sort: { lastUpdated: -1 } },
              { $limit: 1 }
            ],
            as: "leaderboard"
          }
        }
      ]
    };
  }
};

module.exports = {
  userSchema,
  verificationSchema,
  badgeSchema,
  achievementSchema,
  rewardSchema,
  globalStatsSchema,
  leaderboardCacheSchema,
  userActivitySchema,
  locationCacheSchema,
  systemSettingsSchema,
  indexes,
  dashboardQueries
};

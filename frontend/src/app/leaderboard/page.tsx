"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function LeaderboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      // Only auto-close on very small screens
      if (window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const leaderboardData = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      avatar: '👩‍🔬',
      points: 2840,
      level: 'Eco Warrior',
      verifiedReports: 156,
      streak: 12,
      location: 'Mumbai, India',
      badges: ['🌱', '🌿', '🌳', '🌊'],
      change: '+2'
    },
    {
      rank: 2,
      name: 'Mike Chen',
      avatar: '👨‍💻',
      points: 2150,
      level: 'Green Guardian',
      verifiedReports: 98,
      streak: 8,
      location: 'Singapore',
      badges: ['🌱', '🌿', '🌳'],
      change: '+1'
    },
    {
      rank: 3,
      name: 'Priya Patel',
      avatar: '👩‍🌾',
      points: 1890,
      level: 'Seed Planter',
      verifiedReports: 67,
      streak: 5,
      location: 'Kerala, India',
      badges: ['🌱', '🌿'],
      change: '-1'
    },
    {
      rank: 4,
      name: 'David Kim',
      avatar: '👨‍🔬',
      points: 1650,
      level: 'Seed Planter',
      verifiedReports: 45,
      streak: 3,
      location: 'Seoul, Korea',
      badges: ['🌱'],
      change: '+3'
    },
    {
      rank: 5,
      name: 'Emma Wilson',
      avatar: '👩‍🎓',
      points: 1420,
      level: 'Seed Planter',
      verifiedReports: 38,
      streak: 7,
      location: 'Melbourne, Australia',
      badges: ['🌱', '🌿'],
      change: '+1'
    },
    {
      rank: 6,
      name: 'Carlos Rodriguez',
      avatar: '👨‍🌾',
      points: 1280,
      level: 'Seed Planter',
      verifiedReports: 32,
      streak: 4,
      location: 'Mexico City, Mexico',
      badges: ['🌱'],
      change: '-2'
    },
    {
      rank: 7,
      name: 'Aisha Ahmed',
      avatar: '👩‍💼',
      points: 1150,
      level: 'Seed Planter',
      verifiedReports: 28,
      streak: 6,
      location: 'Dubai, UAE',
      badges: ['🌱'],
      change: '+4'
    },
    {
      rank: 8,
      name: 'James Thompson',
      avatar: '👨‍🏫',
      points: 980,
      level: 'Seed Planter',
      verifiedReports: 25,
      streak: 2,
      location: 'London, UK',
      badges: ['🌱'],
      change: '-1'
    }
  ];

  const currentUser = {
    rank: 15,
    name: 'You',
    avatar: '👤',
    points: 650,
    level: 'Seed Planter',
    verifiedReports: 12,
    streak: 3,
    location: 'Your Location',
    badges: ['🌱'],
    change: '+2'
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Eco Warrior':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Green Guardian':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Seed Planter':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-400';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-300 to-yellow-300';
      default:
        return 'from-teal-400 to-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex">
      <Sidebar 
        activeSection="leaderboard" 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        ml-0
      `}>
        <Header 
          title="Leaderboard" 
          subtitle="Top contributors and rankings" 
          onMenuClick={toggleSidebar}
          showSidebarButton={!isSidebarOpen}
          onSidebarOpen={toggleSidebar}
        />
        
        <div className="p-2 sm:p-4 lg:p-6">
          {/* Compact Page Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-gray-700">
              Top contributors ranked by total points earned
            </p>
          </div>

          {/* Compact Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-600">1,234</div>
              <p className="text-xs sm:text-sm text-gray-700">Contributors</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">28,450</div>
              <p className="text-xs sm:text-sm text-gray-700">Points Awarded</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">2,847</div>
              <p className="text-xs sm:text-sm text-gray-700">Reports</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">156</div>
              <p className="text-xs sm:text-sm text-gray-700">Active Streaks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Compact Main Leaderboard */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
                {/* Compact Header */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-3 sm:p-4 text-white">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center">
                    <span className="mr-2">🏆</span>
                    Top Contributors
                  </h2>
                </div>

                {/* Compact Leaderboard List */}
                <div className="divide-y divide-gray-100">
                  {leaderboardData.map((user, index) => (
                    <div key={user.rank} className={`p-3 sm:p-4 transition-all duration-300 hover:bg-teal-50 hover:border-l-4 hover:border-l-teal-400 hover:shadow-md ${
                      index === 0 ? 'bg-yellow-50/50' :
                      index === 1 ? 'bg-gray-50/50' :
                      index === 2 ? 'bg-orange-50/50' : ''
                    }`}>
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                        {/* Compact Rank Badge */}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-br ${getRankGradient(user.rank)} text-white font-bold text-xs sm:text-sm hover:scale-110 transition-transform duration-300`}>
                          {getRankBadge(user.rank)}
                        </div>

                        {/* Compact User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-1">
                            <span className="text-base sm:text-lg hover:scale-110 transition-transform duration-300">{user.avatar}</span>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate hover:text-teal-600 transition-colors duration-300 text-sm sm:text-base">{user.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 text-xs sm:text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.level)} border hover:scale-105 transition-transform duration-300`}>
                              {user.level}
                            </span>
                            <span className="text-gray-700">
                              🔥 {user.streak}d
                            </span>
                            <span className="text-gray-700">
                              ✅ {user.verifiedReports}
                            </span>
                          </div>
                        </div>

                        {/* Compact Points & Badges */}
                        <div className="text-right">
                          <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                            <span className="text-lg sm:text-xl font-bold text-teal-600 hover:scale-110 transition-transform duration-300">{user.points.toLocaleString()}</span>
                            <span className={`text-xs font-medium px-1 sm:px-2 py-1 rounded-full ${
                              user.change.startsWith('+') ? 'text-green-700 bg-green-100 border border-green-300' : 'text-red-700 bg-red-100 border border-red-300'
                            } hover:scale-105 transition-transform duration-300`}>
                              {user.change}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            {user.badges.map((badge, badgeIndex) => (
                              <span key={badgeIndex} className="text-xs sm:text-sm hover:scale-125 transition-transform duration-300" style={{ animationDelay: `${badgeIndex * 100}ms` }}>{badge}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compact Sidebar */}
            <div className="space-y-3 sm:space-y-4">
              {/* Compact Current User Stats */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Your Stats
                </h3>
                
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-3 sm:p-4 border-2 border-teal-300 hover:border-teal-500 transition-all duration-300">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                    <span className="text-lg sm:text-xl hover:scale-110 transition-transform duration-300">{currentUser.avatar}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300 text-sm sm:text-base">{currentUser.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-700">{currentUser.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="bg-white/80 rounded-lg p-2 text-center border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <div className="text-lg sm:text-xl font-bold text-teal-600">{currentUser.points}</div>
                      <p className="text-xs text-gray-700">Points</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2 text-center border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <div className="text-lg sm:text-xl font-bold text-green-600">#{currentUser.rank}</div>
                      <p className="text-xs text-gray-700">Rank</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 sm:pt-3 border-t-2 border-teal-200">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(currentUser.level)} border hover:scale-105 transition-transform duration-300`}>
                        {currentUser.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Reports:</span>
                      <span className="font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300">{currentUser.verifiedReports}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Streak:</span>
                      <span className="font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300">🔥 {currentUser.streak}d</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Level System */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <span className="mr-2">📈</span>
                  Level System
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg hover:scale-110 transition-transform duration-300">🌳</span>
                      <div>
                        <p className="font-semibold text-purple-900 text-xs sm:text-sm">Eco Warrior</p>
                        <p className="text-xs text-purple-700">1500+ points</p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-700 font-medium bg-white px-2 py-1 rounded-full border border-purple-300 hover:border-purple-400 transition-all duration-300">Unlocked</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg hover:scale-110 transition-transform duration-300">🌿</span>
                      <div>
                        <p className="font-semibold text-emerald-900 text-xs sm:text-sm">Green Guardian</p>
                        <p className="text-xs text-emerald-700">500+ points</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-700 font-medium bg-white px-2 py-1 rounded-full border border-emerald-300 hover:border-emerald-400 transition-all duration-300">Unlocked</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg hover:scale-110 transition-transform duration-300">🌱</span>
                      <div>
                        <p className="font-semibold text-green-900 text-xs sm:text-sm">Seed Planter</p>
                        <p className="text-xs text-green-700">0+ points</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-700 font-medium bg-white px-2 py-1 rounded-full border border-green-300 hover:border-green-400 transition-all duration-300">Current</span>
                  </div>
                </div>
              </div>

              {/* Compact Recent Activity */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <span className="mr-2">⚡</span>
                  Recent Activity
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                    <span className="text-green-600 text-base sm:text-lg hover:scale-110 transition-transform duration-300">✅</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm hover:text-teal-600 transition-colors duration-300">Report verified</p>
                      <p className="text-xs text-gray-700">+10 points • 2m ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                    <span className="text-blue-600 text-base sm:text-lg hover:scale-110 transition-transform duration-300">🔥</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm hover:text-teal-600 transition-colors duration-300">Streak milestone</p>
                      <p className="text-xs text-gray-700">3 day streak • 1h ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 bg-purple-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                    <span className="text-purple-600 text-base sm:text-lg hover:scale-110 transition-transform duration-300">🏆</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm hover:text-teal-600 transition-colors duration-300">Rank improved</p>
                      <p className="text-xs text-gray-700">#15 → #14 • 3h ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

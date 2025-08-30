"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Mock user data (replace with actual API call)
  const userData = {
    _id: 'user123',
    username: 'eco_warrior',
    email: 'john.doe@example.com',
    name: 'John Doe',
    avatar: '👨‍🔬',
    points: 650,
    level: 'Seed Planter',
    rank: 15,
    streak: 3,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    badges: [
      {
        badgeId: 'badge1',
        name: 'Seed Planter',
        icon: '🌱',
        unlockedAt: '2024-01-10T14:30:00Z',
        progress: 100
      },
      {
        badgeId: 'badge2',
        name: 'Green Guardian',
        icon: '🌿',
        unlockedAt: '2024-01-12T09:15:00Z',
        progress: 100
      }
    ],

    stats: {
      totalVerifications: 12,
      verifiedReports: 10,
      rejectedReports: 1,
      pendingReports: 1,
      successRate: 91,
      totalPointsEarned: 650,
      joinDate: '2024-01-01T00:00:00Z',
      lastActive: '2024-01-15T10:30:00Z'
    },
    isActive: true,
    isVerified: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  };

  const recentActivity = [
    {
      id: '1',
      type: 'verification_verified',
      title: 'Mangrove trees at Mumbai coastline',
      description: 'Your verification was approved',
      points: '+10',
      timestamp: '2024-01-15T10:30:00Z',
      icon: '✅'
    },
    {
      id: '2',
      type: 'badge_unlocked',
      title: 'Green Guardian Badge',
      description: 'You unlocked the Green Guardian badge',
      points: '+50',
      timestamp: '2024-01-12T09:15:00Z',
      icon: '🌿'
    },
    {
      id: '3',
      type: 'streak_milestone',
      title: '3 Day Streak',
      description: 'You maintained a 3-day activity streak',
      points: '+5',
      timestamp: '2024-01-11T08:45:00Z',
      icon: '🔥'
    },
    {
      id: '4',
      type: 'verification_submitted',
      title: 'Coastal vegetation near Kerala',
      description: 'You submitted a new verification',
      points: '0',
      timestamp: '2024-01-10T14:20:00Z',
      icon: '📸'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Mangrove Master':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Eco Warrior':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Green Guardian':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Seed Planter':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getLevelProgress = () => {
    const levelThresholds = {
      'Seed Planter': 500,
      'Green Guardian': 1000,
      'Eco Warrior': 1500,
      'Mangrove Master': Infinity
    };
    
    const currentThreshold = levelThresholds[userData.level];
    const nextLevel = userData.level === 'Seed Planter' ? 'Green Guardian' : 
                     userData.level === 'Green Guardian' ? 'Eco Warrior' : 'Mangrove Master';
    const nextThreshold = levelThresholds[nextLevel];
    
    if (nextThreshold === Infinity) return 100;
    
    const progress = ((userData.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex">
      <Sidebar 
        activeSection="profile" 
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
          title="My Profile" 
          subtitle="Manage your account and view achievements" 
          onMenuClick={toggleSidebar}
          showSidebarButton={!isSidebarOpen}
          onSidebarOpen={toggleSidebar}
        />
        
        <div className="p-3">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
            <p className="text-sm text-gray-600">Manage your account settings and view your conservation journey.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 text-white rounded-t-xl">
                  <div className="text-center">
                    <div className="text-6xl mb-3">{userData.avatar}</div>
                    <h2 className="text-xl font-bold mb-1">{userData.name}</h2>
                    <p className="text-sm opacity-90">@{userData.username}</p>
                    <div className="flex items-center justify-center mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm ${getLevelColor(userData.level)}`}>
                        {userData.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="text-2xl font-bold text-teal-600">{userData.points}</div>
                      <p className="text-xs text-gray-600">Points</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">#{userData.rank}</div>
                      <p className="text-xs text-gray-600">Rank</p>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600">Level Progress</span>
                      <span className="font-medium text-teal-600">{getLevelProgress().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getLevelProgress()}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Streak</span>
                      <span className="font-semibold text-orange-600">🔥 {userData.streak} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-semibold text-green-600">{userData.stats.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold text-gray-800">{formatDate(userData.stats.joinDate)}</span>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Tab Navigation */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-sm border-2 border-teal-200">
                <div className="flex space-x-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'badges', label: 'Badges', icon: '🏆' },
                    { id: 'activity', label: 'Activity', icon: '📈' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
                {activeTab === 'overview' && (
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📊</span>
                      Overview
                    </h3>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      <div className="bg-teal-50 rounded-lg p-3 border border-teal-200 text-center">
                        <div className="text-xl font-bold text-teal-600">{userData.stats.totalVerifications}</div>
                        <p className="text-xs text-gray-600">Total Submissions</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                        <div className="text-xl font-bold text-green-600">{userData.stats.verifiedReports}</div>
                        <p className="text-xs text-gray-600">Verified</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                        <div className="text-xl font-bold text-blue-600">{userData.badges.length}</div>
                        <p className="text-xs text-gray-600">Badges</p>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">📍</span>
                        Location
                      </h4>
                      <p className="text-sm text-gray-600">
                        {userData.location.city}, {userData.location.state}, {userData.location.country}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coordinates: {userData.location.coordinates.latitude.toFixed(4)}, {userData.location.coordinates.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'badges' && (
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🏆</span>
                      Badges ({userData.badges.length})
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {userData.badges.map((badge) => (
                        <div key={badge.badgeId} className="bg-green-50 border-2 border-green-200 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{badge.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-900">{badge.name}</h4>
                              <p className="text-xs text-green-700">Unlocked {formatDate(badge.unlockedAt)}</p>
                            </div>
                            <span className="text-green-600 text-lg">✅</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {activeTab === 'activity' && (
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📈</span>
                      Recent Activity
                    </h3>
                    
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
                          <span className="text-xl">{activity.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                            <p className="text-xs text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                          </div>
                          <span className={`font-bold text-sm ${
                            activity.points.startsWith('+') ? 'text-green-600' : 
                            activity.points.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {activity.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">⚙️</span>
                      Account Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Profile Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input 
                              type="text" 
                              defaultValue={userData.name}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                              type="email" 
                              defaultValue={userData.email}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                            <select 
                              defaultValue={userData.avatar}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                              <option value="👤">👤 Default</option>
                              <option value="👨‍🔬">👨‍🔬 Scientist</option>
                              <option value="👩‍🌾">👩‍🌾 Gardener</option>
                              <option value="👨‍💻">👨‍💻 Developer</option>
                              <option value="👩‍🎓">👩‍🎓 Student</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Privacy Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Show profile in leaderboard</span>
                            <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Email notifications</span>
                            <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Location sharing</span>
                            <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

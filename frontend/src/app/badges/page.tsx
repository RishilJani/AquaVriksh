"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function BadgesPage() {
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

  const badges = [
    {
      id: '1',
      name: 'Seed Planter',
      icon: '🌱',
      description: 'Complete your first verification',
      requirement: '1 verified submission',
      unlocked: true,
      unlockedAt: '2024-01-10T14:30:00Z',
      rarity: 'common',
      points: 10
    },
    {
      id: '2',
      name: 'Green Guardian',
      icon: '🌿',
      description: 'Reach 500 total points',
      requirement: '500 points',
      unlocked: true,
      unlockedAt: '2024-01-12T09:15:00Z',
      rarity: 'uncommon',
      points: 50
    },
    {
      id: '3',
      name: 'Eco Warrior',
      icon: '🌳',
      description: 'Reach 1500 total points',
      requirement: '1500 points',
      unlocked: false,
      progress: 650,
      target: 1500,
      rarity: 'rare',
      points: 100
    },
    {
      id: '4',
      name: 'Mangrove Master',
      icon: '🌊',
      description: 'Submit 100 verified mangrove reports',
      requirement: '100 verified reports',
      unlocked: false,
      progress: 12,
      target: 100,
      rarity: 'epic',
      points: 200
    },
    {
      id: '5',
      name: 'Streak Champion',
      icon: '🔥',
      description: 'Maintain a 7-day verification streak',
      requirement: '7 day streak',
      unlocked: false,
      progress: 3,
      target: 7,
      rarity: 'rare',
      points: 75
    },
    {
      id: '6',
      name: 'Perfect Score',
      icon: '⭐',
      description: 'Achieve 100% verification accuracy',
      requirement: '10 consecutive verified submissions',
      unlocked: false,
      progress: 5,
      target: 10,
      rarity: 'legendary',
      points: 150
    },
    {
      id: '7',
      name: 'Global Explorer',
      icon: '🌍',
      description: 'Submit reports from 5 different countries',
      requirement: '5 countries',
      unlocked: false,
      progress: 1,
      target: 5,
      rarity: 'epic',
      points: 125
    },
    {
      id: '8',
      name: 'Conservation Pioneer',
      icon: '🏆',
      description: 'Be among the top 10 contributors',
      requirement: 'Top 10 ranking',
      unlocked: false,
      progress: 15,
      target: 10,
      rarity: 'legendary',
      points: 300
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'uncommon':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rare':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Common';
      case 'uncommon':
        return 'Uncommon';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Epic';
      case 'legendary':
        return 'Legendary';
      default:
        return 'Common';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex">
      <Sidebar 
        activeSection="badges" 
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
          title="Badges" 
          subtitle="Unlock achievements and track your progress" 
          onMenuClick={toggleSidebar}
          showSidebarButton={!isSidebarOpen}
          onSidebarOpen={toggleSidebar}
        />
        
        <div className="p-3">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Badges</h1>
            <p className="text-sm text-gray-600">Track your progress and unlock special achievements in coastal conservation.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">{unlockedBadges.length}</div>
              <p className="text-xs text-gray-600">Badges Unlocked</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{badges.length}</div>
              <p className="text-xs text-gray-600">Total Badges</p>
            </div>
          </div>

          {/* Progress Cards Row */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Progress Summary */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Progress Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Badge Completion</span>
                  <span className="font-bold text-teal-600">
                    {Math.round((unlockedBadges.length / badges.length) * 100)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">{unlockedBadges.length}</div>
                    <p className="text-xs text-gray-500">Unlocked</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-600">{lockedBadges.length}</div>
                    <p className="text-xs text-gray-500">Remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Milestone */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
              <h3 className="text-base font-bold text-teal-900 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Next Milestone
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🌳</span>
                  <div>
                    <p className="font-semibold text-teal-900 text-sm">Eco Warrior</p>
                    <p className="text-xs text-teal-700">1500 points needed</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-700">Progress:</span>
                    <span className="font-medium text-teal-900">650/1500</span>
                  </div>
                  <div className="w-full bg-teal-200 rounded-full h-1.5">
                    <div 
                      className="bg-teal-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(650 / 1500) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-teal-600">850 points to go!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 text-white">
              <h2 className="text-lg font-bold flex items-center">
                <span className="mr-2">🏆</span>
                Badges
              </h2>
              <p className="text-sm opacity-90">Unlock badges by completing various challenges</p>
            </div>

            <div className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className={`border-2 rounded-lg p-3 transition-all duration-300 hover:shadow-md hover:scale-105 ${
                    badge.unlocked 
                      ? 'border-teal-200 bg-teal-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{badge.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                            {getRarityBadge(badge.rarity)}
                          </span>
                        </div>
                      </div>
                      {badge.unlocked && (
                        <span className="text-green-600 text-xl">✅</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-xs mb-2">{badge.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">Requirement:</span>
                        <span className="font-semibold text-gray-800">{badge.requirement}</span>
                      </div>
                      
                      {!badge.unlocked && badge.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">Progress:</span>
                            <span className="font-semibold text-gray-800">{badge.progress}/{badge.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-teal-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">Reward:</span>
                        <span className="font-bold text-teal-600">+{badge.points} points</span>
                      </div>
                      
                      {badge.unlocked && badge.unlockedAt && (
                        <div className="text-xs text-gray-600 font-medium">
                          Unlocked: {formatDate(badge.unlockedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

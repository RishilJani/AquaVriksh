"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { getUser } from '../../utils/auth';
import { AuthGuard, useUserId } from '../../components/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';

export default function BadgesPage() {
  const userId = useUserId() || 1; // Fallback to 1 if no user is logged in
  const user = getUser();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    verifiedCount: 0,
    totalSubmissions: 0,
    successRate: 0,
    currentStreak: 0,
    maxStreak: 0,
    countriesVisited: 0,
    currentRank: 0
  });

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch user data and calculate badges
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Check if userId is available
        if (!userId || userId === 1) {
          console.log("Badges: No valid user ID available, skipping API call");
          setBadges([]);
          setUserStats({
            totalPoints: 0,
            verifiedCount: 0,
            totalSubmissions: 0,
            successRate: 0,
            currentStreak: 0,
            maxStreak: 0,
            countriesVisited: 0,
            currentRank: 0
          });
          return;
        }
        
        const serverUrl = process.env.NEXT_PUBLIC_SERVER;
        console.log("Badges: Fetching from:", serverUrl + "/dashboard/" + userId);
        
        const response = await fetch(serverUrl + "/dashboard/" + userId, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        if (!response.ok) {
          console.error(`Badges API Error: ${response.status} ${response.statusText}`);
          throw new Error(`Badges API request failed: ${response.status}`);
        }
        
        const res = await response.json();
        
        if (res.message === "done" && res.data) {
          console.log("User data received:", res.data);
          
          const data = res.data;
          const userVerifications = data.allRecords || [];
          
          // Calculate user statistics
          const totalPoints = userVerifications.reduce((sum: number, record: any) => 
            sum + (record.pointsEarned || 0), 0);
          const verifiedCount = userVerifications.filter((record: any) => record.isApproved === true).length;
          const totalSubmissions = userVerifications.length;
          const successRate = totalSubmissions > 0 ? Math.round((verifiedCount / totalSubmissions) * 100) : 0;
          
          // Calculate streak (simplified - can be enhanced with actual date logic)
          const currentStreak = Math.min(verifiedCount, 7); // Placeholder
          const maxStreak = Math.max(currentStreak, 5); // Placeholder
          
          // Calculate countries visited (simplified)
          const uniqueCountries = new Set(userVerifications.map((record: any) => 
            record.locationDetails?.country || 'Unknown'));
          const countriesVisited = uniqueCountries.size;
          
          // Calculate rank (placeholder - would need leaderboard data)
          const currentRank = Math.floor(Math.random() * 50) + 1; // Placeholder
          
          setUserStats({
            totalPoints,
            verifiedCount,
            totalSubmissions,
            successRate,
            currentStreak,
            maxStreak,
            countriesVisited,
            currentRank
          });
          
          // Define badge criteria and calculate progress
          const badgeDefinitions = [
            {
              id: '1',
              name: 'Seed Planter',
              icon: '🌱',
              description: 'Complete your first verification',
              requirement: '1 verified submission',
              rarity: 'common',
              points: 10,
              checkUnlocked: () => verifiedCount >= 1,
              getProgress: () => ({ current: verifiedCount, target: 1 })
            },
            {
              id: '2',
              name: 'Green Guardian',
              icon: '🌿',
              description: 'Reach 500 total points',
              requirement: '500 points',
              rarity: 'uncommon',
              points: 50,
              checkUnlocked: () => totalPoints >= 500,
              getProgress: () => ({ current: totalPoints, target: 500 })
            },
            {
              id: '3',
              name: 'Eco Warrior',
              icon: '🌳',
              description: 'Reach 1500 total points',
              requirement: '1500 points',
              rarity: 'rare',
              points: 100,
              checkUnlocked: () => totalPoints >= 1500,
              getProgress: () => ({ current: totalPoints, target: 1500 })
            },
            {
              id: '4',
              name: 'Mangrove Master',
              icon: '🌊',
              description: 'Submit 100 verified mangrove reports',
              requirement: '100 verified reports',
              rarity: 'epic',
              points: 200,
              checkUnlocked: () => verifiedCount >= 100,
              getProgress: () => ({ current: verifiedCount, target: 100 })
            },
            {
              id: '5',
              name: 'Streak Champion',
              icon: '🔥',
              description: 'Maintain a 7-day verification streak',
              requirement: '7 day streak',
              rarity: 'rare',
              points: 75,
              checkUnlocked: () => currentStreak >= 7,
              getProgress: () => ({ current: currentStreak, target: 7 })
            },
            {
              id: '6',
              name: 'Perfect Score',
              icon: '⭐',
              description: 'Achieve 100% verification accuracy',
              requirement: '10 consecutive verified submissions',
              rarity: 'legendary',
              points: 150,
              checkUnlocked: () => successRate === 100 && verifiedCount >= 10,
              getProgress: () => ({ current: successRate, target: 100 })
            },
            {
              id: '7',
              name: 'Global Explorer',
              icon: '🌍',
              description: 'Submit reports from 5 different countries',
              requirement: '5 countries',
              rarity: 'epic',
              points: 125,
              checkUnlocked: () => countriesVisited >= 5,
              getProgress: () => ({ current: countriesVisited, target: 5 })
            },
            {
              id: '8',
              name: 'Conservation Pioneer',
              icon: '🏆',
              description: 'Be among the top 10 contributors',
              requirement: 'Top 10 ranking',
              rarity: 'legendary',
              points: 300,
              checkUnlocked: () => currentRank <= 10,
              getProgress: () => ({ current: currentRank, target: 10 })
            }
          ];
          
          // Calculate badge status
          const calculatedBadges = badgeDefinitions.map(badge => {
            const isUnlocked = badge.checkUnlocked();
            const progress = badge.getProgress();
            
            return {
              ...badge,
              unlocked: isUnlocked,
              unlockedAt: isUnlocked ? new Date().toISOString() : null,
              progress: progress.current,
              target: progress.target
            };
          });
          
          setBadges(calculatedBadges);
        } else {
          console.log("No user data available:", res);
          setBadges([]);
          setUserStats({
            totalPoints: 0,
            verifiedCount: 0,
            totalSubmissions: 0,
            successRate: 0,
            currentStreak: 0,
            maxStreak: 0,
            countriesVisited: 0,
            currentRank: 0
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setBadges([]);
        setUserStats({
          totalPoints: 0,
          verifiedCount: 0,
          totalSubmissions: 0,
          successRate: 0,
          currentStreak: 0,
          maxStreak: 0,
          countriesVisited: 0,
          currentRank: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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

  // Skeleton component for loading state
  const BadgeSkeleton = () => (
    <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 bg-gray-300" />
          <div>
            <Skeleton className="h-4 w-24 bg-gray-300 mb-1" />
            <Skeleton className="h-3 w-16 bg-gray-200" />
          </div>
        </div>
        <Skeleton className="h-5 w-5 bg-gray-300" />
      </div>
      <Skeleton className="h-3 w-full bg-gray-200 mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-20 bg-gray-200" />
        <Skeleton className="h-3 w-16 bg-gray-200" />
        <Skeleton className="h-3 w-24 bg-gray-200" />
      </div>
    </div>
  );

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
    <AuthGuard requireAuth={true}>
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
            subtitle={`Unlock achievements and track your progress${user?.username ? ` - ${user.username}` : ''}`}
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
          <div className="grid md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">
                {isLoading ? <Skeleton className="h-8 w-12 bg-teal-200 mx-auto" /> : unlockedBadges.length}
              </div>
              <p className="text-xs text-gray-600">Badges Unlocked</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {isLoading ? <Skeleton className="h-8 w-12 bg-green-200 mx-auto" /> : userStats.totalPoints}
              </div>
              <p className="text-xs text-gray-600">Total Points</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {isLoading ? <Skeleton className="h-8 w-12 bg-blue-200 mx-auto" /> : userStats.verifiedCount}
              </div>
              <p className="text-xs text-gray-600">Verified Reports</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {isLoading ? <Skeleton className="h-8 w-12 bg-purple-200 mx-auto" /> : userStats.successRate}%
              </div>
              <p className="text-xs text-gray-600">Success Rate</p>
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
                    {isLoading ? (
                      <Skeleton className="h-5 w-12 bg-teal-200" />
                    ) : (
                      `${Math.round((unlockedBadges.length / (badges?.length || 1)) * 100)}%`
                    )}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: isLoading ? '0%' : `${(unlockedBadges.length / (badges?.length || 1)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {isLoading ? <Skeleton className="h-6 w-8 bg-green-200 mx-auto" /> : unlockedBadges.length}
                    </div>
                    <p className="text-xs text-gray-500">Unlocked</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-600">
                      {isLoading ? <Skeleton className="h-6 w-8 bg-gray-200 mx-auto" /> : lockedBadges.length}
                    </div>
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
              
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-teal-200" />
                  <Skeleton className="h-4 w-24 bg-teal-200" />
                  <Skeleton className="h-2 w-full bg-teal-200" />
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const nextBadge = badges?.find(badge => !badge.unlocked);
                    if (!nextBadge) {
                      return (
                        <div className="text-center">
                          <p className="font-semibold text-teal-900 text-sm">🎉 All Badges Unlocked!</p>
                          <p className="text-xs text-teal-700">Congratulations!</p>
                        </div>
                      );
                    }
                    
                    const progress = nextBadge.progress || 0;
                    const target = nextBadge.target || 1;
                    const percentage = Math.min((progress / target) * 100, 100);
                    const remaining = target - progress;
                    
                    return (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{nextBadge.icon}</span>
                          <div>
                            <p className="font-semibold text-teal-900 text-sm">{nextBadge.name}</p>
                            <p className="text-xs text-teal-700">{nextBadge.requirement}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-teal-700">Progress:</span>
                            <span className="font-medium text-teal-900">{progress}/{target}</span>
                          </div>
                          <div className="w-full bg-teal-200 rounded-full h-1.5">
                            <div 
                              className="bg-teal-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-teal-600">{remaining} more to go!</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
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
                {isLoading ? (
                  // Show skeleton loading
                  Array.from({ length: 8 }).map((_, index) => (
                    <BadgeSkeleton key={`skeleton-${index}`} />
                  ))
                ) : (badges && badges.length > 0) ? (
                  badges.map((badge) => (
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
                ))
                ) : (
                  // Empty state
                  <div className="col-span-2 text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Badges Available</h3>
                    <p className="text-gray-600 mb-4">Start contributing to coastal conservation to unlock your first badge!</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      📸 Start Contributing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

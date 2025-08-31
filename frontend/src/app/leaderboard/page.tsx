"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { getUser } from '../../utils/auth';
import { AuthGuard, useUserId } from '../../components/AuthGuard';

export default function LeaderboardPage() {
  const userId = useUserId() || 0; // Fallback to 1 if no user is logged in
  const user = getUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for badges (reused from dashboard)
  const [badges, setBadges] = useState<any[]>([]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch leaderboard data
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("user id :  "+userId);
      
             const response = await fetch(process.env.NEXT_PUBLIC_SERVER + "/leaderboard/" + userId, {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const res = await response.json();
      
      if (res.message === "done" && res.data) {
        console.log('Leaderboard data:', res.data);
        setLeaderboardData(res.data);
      } else {
        console.log('No leaderboard data or data not ready:', res);
        setLeaderboardData(null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch badges data (reused from dashboard)
  const fetchBadgesData = useCallback(async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER + "/dashboard/" + userId, {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (response.ok) {
        const res = await response.json();
        
        if (res.data === "done" && res.data.map) {
          setBadges(res.data.map.badges || []);
        } else {
          setBadges([]);
        }
      }
    } catch (err) {
      console.error('Error fetching badges data:', err);
    }
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

  // Fetch data on component mount
  useEffect(() => {
    fetchLeaderboardData();
    fetchBadgesData();
  }, [fetchLeaderboardData, fetchBadgesData]);

  // Skeleton Components for loading states
  const StatsCardSkeleton = React.memo(() => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200">
      <div className="space-y-2">
        <Skeleton className="h-6 w-16 bg-teal-200" />
        <Skeleton className="h-4 w-20 bg-teal-100" />
      </div>
    </div>
  ));

  const LeaderboardItemSkeleton = React.memo(() => (
    <div className="p-3 sm:p-4 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 bg-teal-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 bg-teal-200" />
          <Skeleton className="h-3 w-24 bg-teal-100" />
        </div>
        <Skeleton className="w-16 h-6 bg-teal-200" />
      </div>
    </div>
  ));

  // Helper functions
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

  // Error display component
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex">
        <Sidebar 
          activeSection="leaderboard" 
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
        />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ml-0`}>
          <Header 
            title="Leaderboard" 
            subtitle="Top contributors and rankings" 
            onMenuClick={toggleSidebar}
            showSidebarButton={!isSidebarOpen}
            onSidebarOpen={toggleSidebar}
          />
          
          <div className="p-4 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">Error loading leaderboard data</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button 
                onClick={fetchLeaderboardData}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
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
            {isLoading ? (
              // Show skeleton loading for stats
              Array.from({ length: 4 }).map((_, index) => (
                <StatsCardSkeleton key={`stats-skeleton-${index}`} />
              ))
            ) : (
              <>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-600">
                    {leaderboardData?.totalUser?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Contributors</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    {leaderboardData?.totalPoints?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Points Awarded</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                    {leaderboardData?.totalImages?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Reports</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                    #{leaderboardData?.rank || '--'}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Your Rank</p>
                </div>
              </>
            )}
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
                  {isLoading ? (
                    // Show skeleton loading for leaderboard
                    Array.from({ length: 10 }).map((_, index) => (
                      <LeaderboardItemSkeleton key={`leaderboard-skeleton-${index}`} />
                    ))
                  ) : leaderboardData?.top10 && leaderboardData.top10.length > 0 ? (
                    leaderboardData.top10.map((user: any, index: number) => (
                      <div key={user.userId || index} className={`p-3 sm:p-4 transition-all duration-300 hover:bg-teal-50 hover:border-l-4 hover:border-l-teal-400 hover:shadow-md ${
                        index === 0 ? 'bg-yellow-50/50' :
                        index === 1 ? 'bg-gray-50/50' :
                        index === 2 ? 'bg-orange-50/50' : ''
                      }`}>
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                          {/* Compact Rank Badge */}
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-br ${getRankGradient(index + 1)} text-white font-bold text-xs sm:text-sm hover:scale-110 transition-transform duration-300`}>
                            {getRankBadge(index + 1)}
                          </div>

                          {/* Compact User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 sm:space-x-3 mb-1">
                              <span className="text-base sm:text-lg hover:scale-110 transition-transform duration-300">👤</span>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 truncate hover:text-teal-600 transition-colors duration-300 text-sm sm:text-base">
                                  {user.name || user.userId || 'Unknown User'}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  {user.location || 'Unknown Location'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 text-xs sm:text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.level || 'Seed Planter')} border hover:scale-105 transition-transform duration-300`}>
                                {user.level || 'Seed Planter'}
                              </span>
                              <span className="text-gray-700">
                                ✅ {user.verifiedReports || user.totalVerification || 0}
                              </span>
                            </div>
                          </div>

                          {/* Compact Points */}
                          <div className="text-right">
                            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                              <span className="text-lg sm:text-xl font-bold text-teal-600 hover:scale-110 transition-transform duration-300">
                                {(user.points || user.pointsAwarded || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              {/* Display badges if available */}
                              {user.badges && user.badges.length > 0 ? (
                                user.badges.map((badge: any, badgeIndex: number) => (
                                  <span key={badgeIndex} className="text-xs sm:text-sm hover:scale-125 transition-transform duration-300" style={{ animationDelay: `${badgeIndex * 100}ms` }}>
                                    {badge.icon || '🏆'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs sm:text-sm">🌱</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No leaderboard data available yet.
                    </div>
                  )}
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
                    <span className="text-lg sm:text-xl hover:scale-110 transition-transform duration-300">👤</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300 text-sm sm:text-base">You</h4>
                      <p className="text-xs sm:text-sm text-gray-700">Current Player</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="bg-white/80 rounded-lg p-2 text-center border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <div className="text-lg sm:text-xl font-bold text-teal-600">
                        {leaderboardData?.totalPoints ? Math.floor(leaderboardData.totalPoints / (leaderboardData.totalUser || 1)) : 0}
                      </div>
                      <p className="text-xs text-gray-700">Avg Points</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2 text-center border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <div className="text-lg sm:text-xl font-bold text-green-600">
                        #{leaderboardData?.rank || '--'}
                      </div>
                      <p className="text-xs text-gray-700">Your Rank</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 sm:pt-3 border-t-2 border-teal-200">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Total Users:</span>
                      <span className="font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300">
                        {leaderboardData?.totalUser?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Total Reports:</span>
                      <span className="font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300">
                        {leaderboardData?.totalImages?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Total Points:</span>
                      <span className="font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300">
                        {leaderboardData?.totalPoints?.toLocaleString() || 0}
                      </span>
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
                  {badges.length > 0 ? (
                    badges.map((badge: any, index: number) => (
                      <div key={badge.name || index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-2">
                          <span className="text-base sm:text-lg hover:scale-110 transition-transform duration-300">
                            {badge.icon || '🏆'}
                          </span>
                          <div>
                            <p className="font-semibold text-green-900 text-xs sm:text-sm">
                              {badge.name || 'Unknown Badge'}
                            </p>
                            <p className="text-xs text-green-700">
                              {badge.requirement || 'Achievement unlocked'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-green-700 font-medium bg-white px-2 py-1 rounded-full border border-green-300 hover:border-green-400 transition-all duration-300">
                          {badge.unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No badges available yet.
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { getUser } from '../../utils/auth';
import { AuthGuard, useUserId } from '../../components/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const userId = useUserId() || 1;
  const user = getUser();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [badges, setBadges] = useState<any[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Check if userId is available
        if (!userId || userId === 1) {
          console.log("Profile: No valid user ID available, skipping API call");
          setUserData(null);
          setBadges([]);
          return;
        }
        
        const serverUrl = process.env.NEXT_PUBLIC_SERVER;
        console.log("Profile: Fetching from:", serverUrl + "/dashboard/" + userId);
        
        const response = await fetch(serverUrl + "/dashboard/" + userId, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        if (!response.ok) {
          console.error(`Profile API Error: ${response.status} ${response.statusText}`);
          throw new Error(`Profile API request failed: ${response.status}`);
        }
        
        const res = await response.json();
        
        if (res.message === "done" && res.data) {
          console.log("User data received:", res.data);
          
          const data = res.data;
          const userVerifications = data.allRecords || [];
          
          const totalPoints = userVerifications.reduce((sum: number, record: any) => 
            sum + (record.pointsEarned || 0), 0);
          const verifiedCount = userVerifications.filter((record: any) => record.isApproved === true).length;
          const rejectedCount = userVerifications.filter((record: any) => record.isApproved === false).length;
          const pendingCount = userVerifications.filter((record: any) => record.isApproved === null).length;
          const totalSubmissions = userVerifications.length;
          const successRate = totalSubmissions > 0 ? Math.round((verifiedCount / totalSubmissions) * 100) : 0;
          
          const getLevel = (points: number) => {
            if (points >= 1500) return 'Mangrove Master';
            if (points >= 1000) return 'Eco Warrior';
            if (points >= 500) return 'Green Guardian';
            return 'Seed Planter';
          };
          
          const level = getLevel(totalPoints);
          const rank = Math.floor(Math.random() * 50) + 1;
          const streak = Math.min(verifiedCount, 7);
          
          const uniqueCountries = new Set(userVerifications.map((record: any) => 
            record.locationDetails?.country || 'Unknown'));
          const countriesVisited = uniqueCountries.size;
          
          const badgeDefinitions = [
            {
              badgeId: '1',
              name: 'Seed Planter',
              icon: '🌱',
              checkUnlocked: () => verifiedCount >= 1,
              getProgress: () => ({ current: verifiedCount, target: 1 })
            },
            {
              badgeId: '2',
              name: 'Green Guardian',
              icon: '🌿',
              checkUnlocked: () => totalPoints >= 500,
              getProgress: () => ({ current: totalPoints, target: 500 })
            },
            {
              badgeId: '3',
              name: 'Eco Warrior',
              icon: '🌳',
              checkUnlocked: () => totalPoints >= 1500,
              getProgress: () => ({ current: totalPoints, target: 1500 })
            },
            {
              badgeId: '4',
              name: 'Mangrove Master',
              icon: '🌊',
              checkUnlocked: () => verifiedCount >= 100,
              getProgress: () => ({ current: verifiedCount, target: 100 })
            },
            {
              badgeId: '5',
              name: 'Streak Champion',
              icon: '🔥',
              checkUnlocked: () => streak >= 7,
              getProgress: () => ({ current: streak, target: 7 })
            },
            {
              badgeId: '6',
              name: 'Perfect Score',
              icon: '⭐',
              checkUnlocked: () => successRate === 100 && verifiedCount >= 10,
              getProgress: () => ({ current: successRate, target: 100 })
            },
            {
              badgeId: '7',
              name: 'Global Explorer',
              icon: '🌍',
              checkUnlocked: () => countriesVisited >= 5,
              getProgress: () => ({ current: countriesVisited, target: 5 })
            },
            {
              badgeId: '8',
              name: 'Conservation Pioneer',
              icon: '🏆',
              checkUnlocked: () => rank <= 10,
              getProgress: () => ({ current: rank, target: 10 })
            }
          ];
          
          const calculatedBadges = badgeDefinitions
            .filter(badge => badge.checkUnlocked())
            .map(badge => ({
              ...badge,
              unlockedAt: new Date().toISOString(),
              progress: 100
            }));
          
          setBadges(calculatedBadges);
          
          const userDataObj = {
            _id: userId,
            username: user?.username || 'user',
            email: user?.email || 'user@example.com',
            name: user?.name || user?.username || 'User',
            avatar: '👤',
            points: totalPoints,
            level: level,
            rank: rank,
            streak: streak,
            location: {
              city: 'Unknown',
              state: 'Unknown',
              country: 'Unknown',
              coordinates: {
                latitude: 0,
                longitude: 0
              }
            },
            stats: {
              totalVerifications: totalSubmissions,
              verifiedReports: verifiedCount,
              rejectedReports: rejectedCount,
              pendingReports: pendingCount,
              successRate: successRate,
              totalPointsEarned: totalPoints,
              joinDate: new Date().toISOString(),
              lastActive: userVerifications.length > 0 ? userVerifications[0].date : new Date().toISOString()
            },
            isActive: true,
            isVerified: true,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setUserData(userDataObj);
        } else {
          console.log("No user data available:", res);
          setUserData(null);
          setBadges([]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
        setBadges([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ProfileSkeleton = () => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 border-teal-200">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 text-white rounded-t-xl">
        <div className="text-center">
          <Skeleton className="h-16 w-16 bg-white/20 rounded-full mx-auto mb-3" />
          <Skeleton className="h-6 w-32 bg-white/20 mx-auto mb-1" />
          <Skeleton className="h-4 w-24 bg-white/20 mx-auto mb-2" />
          <Skeleton className="h-5 w-28 bg-white/20 mx-auto" />
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Skeleton className="h-16 bg-teal-100 rounded-lg" />
          <Skeleton className="h-16 bg-green-100 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-full bg-gray-200 mb-2" />
        <Skeleton className="h-2 w-full bg-gray-200 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-gray-200" />
          <Skeleton className="h-4 w-24 bg-gray-200" />
          <Skeleton className="h-4 w-28 bg-gray-200" />
        </div>
        <Skeleton className="h-10 w-full bg-teal-200 rounded-lg mt-4" />
      </div>
    </div>
  );

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
    if (!userData) return 0;
    
    const levelThresholds: Record<string, number> = {
      'Seed Planter': 500,
      'Green Guardian': 1000,
      'Eco Warrior': 1500,
      'Mangrove Master': Infinity
    };
    
    const currentThreshold = levelThresholds[userData.level] || 0;
    const nextLevel = userData.level === 'Seed Planter' ? 'Green Guardian' : 
                     userData.level === 'Green Guardian' ? 'Eco Warrior' : 'Mangrove Master';
    const nextThreshold = levelThresholds[nextLevel] || Infinity;
    
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

  return (
    <AuthGuard requireAuth={true}>
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
            subtitle={`Manage your account and view achievements${user?.username ? ` - ${user.username}` : ''}`}
            onMenuClick={toggleSidebar}
            showSidebarButton={!isSidebarOpen}
            onSidebarOpen={toggleSidebar}
          />
        
          <div className="p-3">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
              <p className="text-sm text-gray-600">Manage your account settings and view your conservation journey.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                {isLoading ? (
                  <ProfileSkeleton />
                ) : userData ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
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

                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 border-teal-200 p-8 text-center">
                    <div className="text-6xl mb-4">👤</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Profile Data</h3>
                    <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      🔄 Refresh Page
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-sm border-2 border-teal-200">
                  <div className="flex space-x-1">
                    {[
                      { id: 'overview', label: 'Overview', icon: '📊' },
                      { id: 'badges', label: 'Badges', icon: '🏆' },
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

                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
                  {activeTab === 'overview' && userData && (
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        Overview
                      </h3>
                      
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
                          <div className="text-xl font-bold text-blue-600">{badges?.length || 0}</div>
                          <p className="text-xs text-gray-600">Badges</p>
                        </div>
                      </div>

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
                        Badges ({badges?.length || 0})
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        {badges?.map((badge: any) => (
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

                  {activeTab === 'settings' && userData && (
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
    </AuthGuard>
  );
}

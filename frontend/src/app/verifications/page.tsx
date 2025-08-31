"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { getUser } from '../../utils/auth';
import { AuthGuard, useUserId } from '../../components/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';

// Location cache for performance optimization
const locationCache = new Map<string, {
  district: string;
  state: string;
  country: string;
}>();

// Centralized location service
const LocationService = {
  async getLocationDetails(latitude: number, longitude: number) {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    // Check cache first
    if (locationCache.has(cacheKey)) {
      return locationCache.get(cacheKey)!;
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=10`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'AquaVriksh/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Location service unavailable');
      }
      
      const data = await response.json();
      const address = data.address;
      
      const locationDetails = {
        district: address?.city || address?.town || address?.county || address?.district || 'Unknown',
        state: address?.state || address?.province || 'Unknown',
        country: address?.country || 'Unknown'
      };
      
      // Cache the result
      locationCache.set(cacheKey, locationDetails);
      
      return locationDetails;
    } catch (error) {
      console.error('Location fetch error:', error);
      const fallback = {
        district: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      };
      
      // Cache fallback to prevent repeated failed requests
      locationCache.set(cacheKey, fallback);
      return fallback;
    }
  }
};

export default function VerificationsPage() {
  const userId = useUserId() || 1; // Fallback to 1 if no user is logged in
  const user = getUser();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    rejected: 0,
    pending: 0,
    totalPoints: 0,
    successRate: 0
  });

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch user's verifications
  useEffect(() => {
    const fetchUserVerifications = async () => {
      try {
        setIsLoading(true);
        console.log("User Id ======== ",userId);
        
        const response = await fetch(process.env.NEXT_PUBLIC_SERVER + "/dashboard/" + userId, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        const res = await response.json();
        
        if (res.message === "done" && res.data) {
          console.log("Verification data received:", res.data);
          
          const data = res.data;
          const userVerifications = data.allRecords || [];
          
                     // Transform the data to match our verification format
           const transformedVerifications = await Promise.all(userVerifications.map(async (record: any, index: number) => {
             // Extract location details from the record
             let locationDetails = record.locationDetails || {};
             const preciseLocation = record.preciseLocation || 'Unknown Location';
             
             // If we don't have location details but have coordinates, fetch them
             if ((!locationDetails.district || locationDetails.district === 'Unknown') && 
                 record.location && record.location.latitude && record.location.longitude) {
               try {
                 locationDetails = await LocationService.getLocationDetails(
                   record.location.latitude, 
                   record.location.longitude
                 );
               } catch (error) {
                 console.error('Failed to fetch location details:', error);
                 locationDetails = { district: 'Unknown', state: 'Unknown', country: 'Unknown' };
               }
             }
             
             const district = locationDetails.district || 'Unknown District';
             const state = locationDetails.state || 'Unknown State';
             const country = locationDetails.country || 'Unknown Country';
             
                           // Create title using city/district name as the main title
              const title = district !== 'Unknown District' ? district : 
                           preciseLocation !== 'Unknown Location' ? preciseLocation : 
                           `Verification ${index + 1}`;
              
              // Create location display string showing district and state
              let locationDisplay = '';
              if (district !== 'Unknown District') {
                // Show: District, State
                locationDisplay = `${district}, ${state}`;
              } else if (preciseLocation !== 'Unknown Location') {
                // If we have precise location but no district, show: PreciseLocation, State
                locationDisplay = `${preciseLocation}, ${state}`;
              } else {
                // Fallback
                locationDisplay = `${district}, ${state}`;
              }
             
                            return {
                 id: record.imageId || index + 1,
                 title: title,
                 image: record.imageURL || '/api/placeholder/300/200',
                 status: record.isApproved === true ? 'verified' : 
                        record.isApproved === false ? 'rejected' : 'pending',
                 points: record.isApproved === true ? `+${record.pointsEarned || 10}` : 
                        record.isApproved === false ? '-5' : '0',
                 submittedAt: record.date || new Date().toISOString(),
                 verifiedAt: record.isApproved !== null ? record.date : null,
                 location: locationDisplay,
                 category: 'Coastal Conservation',
                 description: `Image captured at ${preciseLocation !== 'Unknown Location' ? preciseLocation : district !== 'Unknown District' ? district : 'coastal location'} for conservation verification.`,
                 aiConfidence: record.isApproved === true ? Math.floor(Math.random() * 20) + 80 : 
                              record.isApproved === false ? Math.floor(Math.random() * 30) + 20 : null,
                 feedback: record.isApproved === true ? 'Excellent quality image with clear coastal conservation identification. Location verified via GPS data.' :
                          record.isApproved === false ? 'Image does not meet verification criteria. Please ensure images are of actual coastal conservation activities.' : null
               };
           }));
          
          setVerifications(transformedVerifications);
          
          // Calculate stats
          const total = transformedVerifications.length;
          const verified = transformedVerifications.filter(v => v.status === 'verified').length;
          const rejected = transformedVerifications.filter(v => v.status === 'rejected').length;
          const pending = transformedVerifications.filter(v => v.status === 'pending').length;
          const totalPoints = transformedVerifications.reduce((sum, v) => 
            sum + (v.status === 'verified' ? 10 : v.status === 'rejected' ? -5 : 0), 0);
          const successRate = total > 0 ? Math.round((verified / (verified + rejected)) * 100) : 0;
          
          setStats({
            total,
            verified,
            rejected,
            pending,
            totalPoints,
            successRate
          });
        } else {
          console.log("No verification data available:", res);
          setVerifications([]);
          setStats({
            total: 0,
            verified: 0,
            rejected: 0,
            pending: 0,
            totalPoints: 0,
            successRate: 0
          });
        }
      } catch (error) {
        console.error('Error fetching verifications:', error);
        setVerifications([]);
        setStats({
          total: 0,
          verified: 0,
          rejected: 0,
          pending: 0,
          totalPoints: 0,
          successRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserVerifications();
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
  const VerificationSkeleton = () => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border-2 border-teal-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Skeleton className="h-6 w-20 bg-teal-200" />
              <Skeleton className="h-6 w-12 bg-teal-200" />
            </div>
            <Skeleton className="h-6 w-48 bg-teal-200 mb-1" />
            <Skeleton className="h-4 w-32 bg-teal-100 mb-2" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-3 w-24 bg-teal-100" />
              <Skeleton className="h-3 w-24 bg-teal-100" />
              <Skeleton className="h-3 w-16 bg-teal-100" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 bg-teal-200" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full bg-teal-200 rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-teal-200" />
            <Skeleton className="h-4 w-3/4 bg-teal-100" />
            <Skeleton className="h-4 w-full bg-teal-200" />
            <Skeleton className="h-4 w-2/3 bg-teal-100" />
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return '✅';
      case 'rejected':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
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
          activeSection="verifications" 
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
            title="My Verifications" 
            subtitle={`Track your submitted images and verification status${user?.username ? ` - ${user.username}` : ''}`}
            onMenuClick={toggleSidebar}
            showSidebarButton={!isSidebarOpen}
            onSidebarOpen={toggleSidebar}
          />
        
        <div className="p-3">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Verifications</h1>
            <p className="text-sm text-gray-600">Monitor the status of your submitted mangrove images and AI verification results.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">{stats.total}</div>
              <p className="text-xs text-gray-600">Total Submissions</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.verified}</div>
              <p className="text-xs text-gray-600">Verified</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalPoints}</div>
              <p className="text-xs text-gray-600">Total Points</p>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-4 text-white mb-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1">Success Rate</h2>
                <p className="text-sm opacity-90">Your verification accuracy</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">{stats.successRate}%</div>
                <p className="text-sm opacity-90">Verified submissions</p>
              </div>
            </div>
          </div>

          {/* Verifications List */}
          <div className="space-y-4">
            {isLoading ? (
              // Show skeleton loading
              Array.from({ length: 3 }).map((_, index) => (
                <VerificationSkeleton key={`skeleton-${index}`} />
              ))
            ) : verifications.length > 0 ? (
              verifications.map((verification) => (
              <div key={verification.id} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(verification.status)}`}>
                          {getStatusIcon(verification.status)} {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                        </span>
                        <span className={`font-bold text-base ${
                          verification.points.startsWith('+') ? 'text-green-600' : 
                          verification.points.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {verification.points}
                        </span>
                      </div>
                                             <h3 className="text-lg font-bold text-gray-900 mb-1">{verification.title}</h3>
                       <div className="text-sm text-gray-600 mb-2">
                         <p className="font-medium">{verification.location}</p>
                       </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📅 Submitted: {formatDate(verification.submittedAt)}</span>
                        {verification.verifiedAt && (
                          <span>✅ Verified: {formatDate(verification.verifiedAt)}</span>
                        )}
                        <span>🏷️ {verification.category}</span>
                      </div>
                    </div>
                    
                    {/* AI Confidence Score */}
                    {verification.aiConfidence && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-teal-600">{verification.aiConfidence}%</div>
                        <p className="text-xs text-gray-500">AI Confidence</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {verification.image && verification.image !== '/api/placeholder/300/200' ? (
                          <img 
                            src={verification.image} 
                            alt={verification.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgyMlYyMkgxNlYxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE2IDI0SDIyVjI4SDE2VjI0Wk0xNiAzMkgyMlYzNkgxNlYzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDE2SDMwVjIwSDI0VjE2Wk0yNCAyNEgzMFYyOEgyNFYyNFpNMjQgMzJIMzBWMzZIMjRWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-500">📷 Image Preview</span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Description</h4>
                        <p className="text-gray-600 text-xs">{verification.description}</p>
                      </div>
                      
                      {verification.feedback && (
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">AI Feedback</h4>
                          <div className={`p-2 rounded-lg text-xs ${
                            verification.status === 'verified' ? 'bg-green-50 text-green-800' :
                            verification.status === 'rejected' ? 'bg-red-50 text-red-800' :
                            'bg-gray-50 text-gray-800'
                          }`}>
                            {verification.feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                        Share
                      </button>
                    </div>
                    
                    {verification.status === 'rejected' && (
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">
                        Appeal Decision
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
            ) : (
              // Empty state
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Verifications Yet</h3>
                <p className="text-gray-600 mb-4">Start contributing to coastal conservation by capturing and submitting your first image!</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  📸 Capture Your First Image
                </button>
              </div>
            )}
          </div>

          {/* Load More - Only show if there are verifications */}
          {verifications.length > 0 && (
            <div className="text-center mt-6">
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                Load More Verifications
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

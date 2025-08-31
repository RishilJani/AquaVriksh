"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadImage } from '../utils/cloudinary-upload';
import { getUser } from '../utils/auth';
import { AuthGuard, useUserId } from '../components/AuthGuard';

// TypeScript interfaces
interface Contribution {
  imageId: number;
  imageURL: string;
  userId: number;
  isApproved: boolean | null; // true: verified, false: rejected, null: pending
  date: string;
  pointsEarned: number;
  location: {
    latitude: number;
    longitude: number;
  };
  locationDetails?: {
    district: string;
    state: string;
    country: string;
  };
  preciseLocation?: string; // Store the exact location name like "Sabarmati Taluka"
}

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
  },
  
  // Batch fetch multiple locations
  async getBatchLocationDetails(contributions: Contribution[]) {
    const uniqueLocations = new Map<string, { lat: number; lon: number; contributions: Contribution[] }>();
    
    // Group contributions by location (rounded to 4 decimal places for caching)
    contributions.forEach(contribution => {
      const cacheKey = `${contribution.location.latitude.toFixed(4)},${contribution.location.longitude.toFixed(4)}`;
      if (!uniqueLocations.has(cacheKey)) {
        uniqueLocations.set(cacheKey, {
          lat: contribution.location.latitude,
          lon: contribution.location.longitude,
          contributions: []
        });
      }
      uniqueLocations.get(cacheKey)!.contributions.push(contribution);
    });
    
    // Fetch all unique locations in parallel
    const locationPromises = Array.from(uniqueLocations.values()).map(async ({ lat, lon }) => {
      return this.getLocationDetails(lat, lon);
    });
    
    const locationResults = await Promise.all(locationPromises);
    
    // Map results back to contributions
    const locationMap = new Map<string, typeof locationResults[0]>();
    let resultIndex = 0;
    
    uniqueLocations.forEach(({ lat, lon }) => {
      const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      locationMap.set(cacheKey, locationResults[resultIndex]);
      resultIndex++;
    });
    
    return locationMap;
  }
};

// Skeleton Components for loading states
const StatsCardSkeleton = React.memo(() => (
  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-20 bg-teal-200" />
        <Skeleton className="h-6 w-16 bg-teal-300" />
        <Skeleton className="h-3 w-24 bg-teal-200" />
      </div>
      <Skeleton className="w-10 h-10 bg-teal-200 rounded-lg" />
    </div>
  </div>
));

StatsCardSkeleton.displayName = 'StatsCardSkeleton';

const ContributionCardSkeleton = React.memo(() => (
  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
    <Skeleton className="w-12 h-12 bg-teal-200 rounded-lg" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-3 w-20 bg-teal-200" />
      <Skeleton className="h-2 w-16 bg-teal-100" />
      <Skeleton className="h-2 w-24 bg-teal-100" />
      <Skeleton className="h-2 w-16 bg-teal-100" />
    </div>
    <div className="text-right space-y-1">
      <Skeleton className="h-3 w-12 bg-teal-200" />
      <Skeleton className="h-2 w-8 bg-teal-100" />
    </div>
  </div>
));

ContributionCardSkeleton.displayName = 'ContributionCardSkeleton';

const BadgeCardSkeleton = React.memo(() => (
  <div className="flex items-center space-x-3 p-2 rounded-lg border border-gray-200">
    <Skeleton className="w-6 h-6 bg-teal-200 rounded-full" />
    <div className="flex-1 min-w-0 space-y-1">
      <Skeleton className="h-3 w-20 bg-teal-200" />
      <Skeleton className="h-2 w-32 bg-teal-100" />
    </div>
  </div>
));

BadgeCardSkeleton.displayName = 'BadgeCardSkeleton';



// Optimized LocationDisplay component with memoization
const LocationDisplay = React.memo(({ 
  latitude, 
  longitude, 
  captureMode,
  onLocationDetailsReady,
  onPreciseLocationReady
}: { 
  latitude: number; 
  longitude: number; 
  captureMode: 'environment' | 'selfie';
  onLocationDetailsReady?: (details: { district: string; state: string; country: string }) => void;
  onPreciseLocationReady?: (preciseLocation: string) => void;
}) => {
  const [addressDetails, setAddressDetails] = useState<{
    district: string;
    state: string;
    country: string;
  } | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  // Memoized timestamp to prevent unnecessary re-renders
  const timestamp = useMemo(() => new Date(), []);

    // Optimized address fetching with error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchAddressDetails = async () => {
      try {
        const details = await LocationService.getLocationDetails(latitude, longitude);
        
        if (isMounted) {
          setAddressDetails(details);
          
          // Call the callback to pass location details to parent
          if (onLocationDetailsReady) {
            onLocationDetailsReady(details);
          }
          
          // Extract precise location name (like "Sabarmati Taluka")
          const preciseLocationName = details.district;
          if (onPreciseLocationReady) {
            onPreciseLocationReady(preciseLocationName);
          }
        }
      } catch (error) {
        if (isMounted) {
          setAddressDetails({
            district: 'Unknown',
            state: 'Unknown',
            country: 'Unknown'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingAddress(false);
        }
      }
    };

    fetchAddressDetails();
    return () => { isMounted = false; };
  }, [latitude, longitude, onLocationDetailsReady]);

  // Memoized helper functions
  const timeInfo = useMemo(() => {
    const hour = timestamp.getHours();
    const getTimeOfDay = () => {
      if (hour >= 5 && hour < 12) return 'Morning';
      if (hour >= 12 && hour < 17) return 'Afternoon';
      if (hour >= 17 && hour < 21) return 'Evening';
      return 'Night';
    };

    return {
      date: timestamp.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      timeOfDay: getTimeOfDay()
    };
  }, [timestamp]);

  return (
    <div className="mt-3 p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200">
      <h3 className="font-bold text-teal-900 mb-2 flex items-center text-sm">
        <span className="mr-2">📍</span>
        Location & Time Details
      </h3>
      <div className="grid grid-cols-1 gap-3 text-left">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-teal-600">🗺️</span>
            <div>
              {isLoadingAddress ? (
                <p className="text-teal-700 text-xs">Loading address...</p>
              ) : (
                <>
                  <p className="font-semibold text-teal-900 text-xs">{addressDetails?.district}</p>
                  <p className="text-teal-700 text-xs">{addressDetails?.state}, {addressDetails?.country}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-teal-600">📍</span>
            <div>
              <p className="text-teal-700 text-xs">Lat: {latitude.toFixed(6)}</p>
              <p className="text-teal-700 text-xs">Long: {longitude.toFixed(6)}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-teal-600">📅</span>
            <div>
              <p className="font-semibold text-teal-900 text-xs">{timeInfo.date}</p>
              <p className="text-teal-700 text-xs">{timeInfo.timeOfDay} • {timeInfo.time}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-teal-600">📸</span>
            <div>
              <p className="text-teal-700 text-xs">
                Mode: {captureMode === 'environment' ? '🌍 Environment' : '📱 Selfie'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LocationDisplay.displayName = 'LocationDisplay';

// Optimized AnimatedCounter with better performance
const AnimatedCounter = React.memo(({ 
  target, 
  duration = 2000, 
  suffix = '', 
  decimal = 0 
}: { 
  target: number; 
  duration?: number; 
  suffix?: string; 
  decimal?: number; 
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const currentCount = Math.floor(target * progress);
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration]);
  
  return (
    <span className="text-xl font-bold text-gray-900">
      {count.toLocaleString()}{suffix}
    </span>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

// Optimized Stats Card component
const StatsCard = React.memo(({ 
  title, 
  value, 
  icon, 
  trend, 
  trendColor,
  isLoading = false
}: { 
  title: string; 
  value: number | null; 
  icon: string; 
  trend: string; 
  trendColor: string; 
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return <StatsCardSkeleton />;
  }
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-102">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-700 font-medium">{title}</p>
          {value !== null ? (
            <AnimatedCounter target={value} duration={2500} />
          ) : (
            <span className="text-xl font-bold text-gray-400">--</span>
          )}
          <p className={`text-xs font-medium ${trendColor}`}>{trend}</p>
        </div>
        <div className="text-lg bg-teal-100 p-2 rounded-lg">{icon}</div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

// Optimized Contribution Card component using new schema
const ContributionCard = React.memo(({ 
  contribution, 
  index,
  locationDetails,
  isLoadingLocation
}: { 
  contribution: Contribution; 
  index: number;
  locationDetails?: {
    district: string;
    state: string;
    country: string;
  } | null;
  isLoadingLocation?: boolean;
}) => {
  const rankColors = [
    'bg-yellow-50/50 border-yellow-200',
    'bg-gray-50/50 border-gray-200', 
    'bg-orange-50/50 border-orange-200',
    'border-gray-200 hover:border-teal-300'
  ];

  const getStatusIcon = (isApproved: boolean | null) => {
    if (isApproved === true) return '✅';
    if (isApproved === false) return '❌';
    return '⏳';
  };

  const getStatusColor = (isApproved: boolean | null) => {
    if (isApproved === true) return 'text-green-600';
    if (isApproved === false) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusText = (isApproved: boolean | null) => {
    if (isApproved === true) return 'Verified';
    if (isApproved === false) return 'Rejected';
    return 'Pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-102 border ${rankColors[index] || rankColors[3]}`}>
      {/* Image Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
        <img 
          src={contribution.imageURL} 
          alt={`Contribution ${contribution.imageId}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgyMlYyMkgxNlYxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE2IDI0SDIyVjI4SDE2VjI0Wk0xNiAzMkgyMlYzNkgxNlYzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDE2SDMwVjIwSDI0VjE2Wk0yNCAyNEgzMFYyOEgyNFYyNFpNMjQgMzJIMzBWMzZIMjRWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
          }}
        />
      </div>

              {/* Content */}
        <div className="flex-1 min-w-0">
          
          {/* Status */}
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-sm ${getStatusColor(contribution.isApproved)}`}>
              {getStatusIcon(contribution.isApproved)}
            </span>
            <p className={`text-xs font-medium ${getStatusColor(contribution.isApproved)}`}>
              {getStatusText(contribution.isApproved)}
            </p>
          </div>

                     {/* Location */}
           <div className="flex items-center space-x-2 mb-2">
             <span className="text-gray-500 text-xs">📍</span>
             <div className="min-w-0">
               {isLoadingLocation ? (
                 <p className="text-gray-500 text-xs">Loading location...</p>
               ) : contribution.preciseLocation ? (
                 <>
                   <p className="font-semibold text-gray-900 text-xs truncate">
                     {contribution.preciseLocation}
                   </p>
                   <p className="text-xs text-gray-600 truncate">
                     {locationDetails?.state}, {locationDetails?.country}
                   </p>
                 </>
               ) : locationDetails ? (
                 <>
                   <p className="font-semibold text-gray-900 text-xs truncate">
                     {locationDetails.district}
                   </p>
                   <p className="text-xs text-gray-600 truncate">
                     {locationDetails.state}, {locationDetails.country}
                   </p>
                 </>
               ) : (
                 <p className="text-gray-500 text-xs">Location unavailable</p>
               )}
             </div>
           </div>

          {/* Date */}
          <p className="text-xs text-gray-500">
            {formatDate(contribution.date)}
          </p>
        </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-teal-600 text-sm">
          +{contribution.pointsEarned}
        </p>
        <p className="text-xs text-gray-600">
          #{contribution.imageId}
        </p>
      </div>
    </div>
  );
});

ContributionCard.displayName = 'ContributionCard';

export default function Home() {
  const userId = useUserId() || 0; // Fallback to 1 if no user is logged in
  const user = getUser();
  const router = useRouter();
  
  // Consolidated state management
  const [cameraState, setCameraState] = useState({
    capturedImage: null as string | null,
    isOpen: false,
    permission: 'pending' as 'granted' | 'denied' | 'pending',
    mode: 'environment'
  });
  
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [locationDetails, setLocationDetails] = useState<{
    district: string;
    state: string;
    country: string;
  } | null>(null);
  
  const [preciseLocation, setPreciseLocation] = useState<string>('');
  

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  
  // Optimized sidebar functions
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const [isLoading,setIsLoading] = useState(true);

  // Auto-close sidebar on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }
    };

    const fetchDashboardData = async () => {
      try {
        setIsLoadingStats(true);
        setIsLoadingContributors(true);
        setIsLoadingBadges(true);
        
        const response = await fetch(process.env.NEXT_PUBLIC_SERVER + "/dashboard/" + userId, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        const res = await response.json();
        
        if (res.message === "done" && res.data) {
          console.log("Data received:", res.data);
          
          const data = res.data;
          
          // Update stats data
          setStatsData({
            successRate: data.successRate || null,
            totalVerification: data.totalVerification || null,
            pointsAwarded: data.pointsAwarded || null
          });
          
                     // Update contributors data
           if (data.totalVerification != null && data.totalVerification > 0) {
             const contributions = data.allRecords || [];
             setTopContribution(contributions);
             
             // Fetch location details for all contributions
             if (contributions.length > 0) {
               setIsLoadingLocations(true);
               try {
                 const locationMap = await LocationService.getBatchLocationDetails(contributions);
                 setLocationDataMap(locationMap);
               } catch (error) {
                 console.error('Failed to fetch location details:', error);
               } finally {
                 setIsLoadingLocations(false);
               }
             }
           } else {
             setTopContribution([]);
             setLocationDataMap(new Map());
           }
          
          // Update badges data (assuming badges are in the response)
          setBadges(data.badges || []);
        } else {
          console.log("No data or data not ready:", res);
          setTopContribution([]);
          setBadges([]);
          setStatsData({
            successRate: null,
            totalVerification: null,
            pointsAwarded: null
          });
        }
      } catch (e) {
        console.log(e);
        setTopContribution([]);
        setBadges([]);
        setStatsData({
          successRate: null,
          totalVerification: null,
          pointsAwarded: null
        });
      } finally {
        setIsLoading(false);
        setIsLoadingStats(false);
        setIsLoadingContributors(false);
        setIsLoadingBadges(false);
      }
    };

    fetchDashboardData();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optimized location fetching
  const getLocationData = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          const errorMessages: Record<number, string> = {
            [error.PERMISSION_DENIED]: 'Location permission denied',
            [error.POSITION_UNAVAILABLE]: 'Location unavailable',
            [error.TIMEOUT]: 'Location request timed out'
          };
          reject(new Error(errorMessages[error.code] || 'Unknown location error'));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
      );
    });
  }, []);

  // Optimized camera functions
  const openCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported');
      }
      
      setCameraState(prev => ({ ...prev, isOpen: true, permission: 'pending' }));
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraState(prev => ({ ...prev, permission: 'granted', mode: 'environment' }));
      }
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraState(prev => ({ ...prev, permission: 'granted', mode: 'selfie' }));
        }
      } catch (selfieErr) {
        setCameraState(prev => ({ ...prev, isOpen: false, permission: 'denied' }));
        alert('Camera access denied. Please check permissions.');
      }
    }
  }, []);

  const switchCameraMode = useCallback(async () => {
    if (!cameraState.isOpen) return;
    
    const newMode = cameraState.mode === 'environment' ? 'selfie' : 'environment';
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newMode === 'environment' ? 'environment' : 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraState(prev => ({ ...prev, mode: newMode }));
      }
    } catch (err) {
      alert(`Unable to switch to ${newMode} mode`);
    }
  }, [cameraState.isOpen, cameraState.mode]);

  const closeCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraState(prev => ({ ...prev, isOpen: false, permission: 'pending' }));
  }, []);

  const captureImage = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCameraState(prev => ({ ...prev, capturedImage: imageDataUrl, isOpen: false }));
        closeCamera();
        
        setIsLoadingLocation(true);
        try {
          const location = await getLocationData();
          setLocationData(location);
        } catch (error) {
          alert('Unable to get location data. Please ensure location permissions are granted.');
        } finally {
          setIsLoadingLocation(false);
        }
      }
    }
  }, [closeCamera, getLocationData]);

  const [isUploading, setIsUploading] = useState(false);

  const submitImage = useCallback(async () => {
    if (cameraState.capturedImage && locationData) {
      setIsUploading(true);
      try {
        console.log('Starting Cloudinary upload process...');
        
                 const result = await uploadImage(
           cameraState.capturedImage, 
           {
             ...locationData,
             locationDetails: locationDetails || {
               district: 'Unknown',
               state: 'Unknown',
               country: 'Unknown'
             },
             preciseLocation: preciseLocation || 'Unknown Location'
           }, 
           userId?.toString() || '1'
         );
        
        console.log('Upload completed successfully:', result);
        alert('✅ Photo uploaded successfully to Cloudinary and sent to server!');
        
        // Refresh dashboard data after successful upload
        // You can add a function to refresh the dashboard data here
        
        setCameraState(prev => ({ ...prev, capturedImage: null }));
        setLocationData(null);
        setLocationDetails(null);
        setPreciseLocation('');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('❌ Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsUploading(false);
      }
    } else {
      alert('Please capture a photo and ensure location is available before uploading.');
    }
  }, [cameraState.capturedImage, locationData, userId]);

  // Memoized data with loading states
  const [topContribution, setTopContribution] = useState<Contribution[]>([]);
  const [statsData, setStatsData] = useState({
    "successRate": null,
    "totalVerification": null,
    "pointsAwarded": null 
  });
  const [badges, setBadges] = useState<any[]>([]);
  
  // Location data state
  const [locationDataMap, setLocationDataMap] = useState<Map<string, {
    district: string;
    state: string;
    country: string;
  }>>(new Map());
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingContributors, setIsLoadingContributors] = useState(true);
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex">
        <Sidebar 
          activeSection="dashboard" 
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
        />
      
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ml-0`}>
        <Header 
          onMenuClick={toggleSidebar} 
          showSidebarButton={!isSidebarOpen}
          onSidebarOpen={toggleSidebar}
        />
        
        <div className="p-2 sm:p-3">

          {/* Image Upload Section - Mobile Optimized */}
          <section className="mb-3 sm:mb-4 max-w-[90vmin] m-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="mr-2">📸</span>
                Capture Coastal Conservation
              </h2>
              
              {/* Image Capture Area - Mobile Optimized */}
              <div className="mb-4 sm:mb-6">
                <div 
                  className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-all duration-300 touch-manipulation"
                  onClick={() => {
                    if (!cameraState.capturedImage && !cameraState.isOpen) {
                      openCamera();
                    }
                  }}
                >
                  {!cameraState.capturedImage && !cameraState.isOpen && (
                    <div className="text-center py-6 sm:py-8">
                      <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 animate-pulse">📷</div>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-base sm:text-lg font-semibold">📱 Tap Here to Open Camera</p>
                      <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm">
                        Capture coastal conservation activities
                      </p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>• Camera permission will be requested</div>
                        <div>• Environment mode preferred (selfie fallback)</div>
                        <div>• Location data will be captured automatically</div>
                      </div>
                      <div className="mt-3 sm:mt-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-xs">💡 Click anywhere in this area to start</p>
                      </div>
                    </div>
                  )}
                
                  {cameraState.isOpen && (
                    <div className="text-center">
                      {/* Camera Mode Toggle - Mobile Optimized */}
                      <div className="mb-3 sm:mb-4 flex justify-center">
                        <div className="bg-white rounded-lg p-1 shadow-lg border-2 border-teal-200">
                          <button
                            onClick={switchCameraMode}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation ${
                              cameraState.mode === 'environment' 
                                ? 'bg-teal-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-teal-600'
                            }`}
                          >
                            🌍 Environment
                          </button>
                          <button
                            onClick={switchCameraMode}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation ${
                              cameraState.mode === 'selfie' 
                                ? 'bg-teal-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-teal-600'
                            }`}
                          >
                            📱 Selfie
                          </button>
                        </div>
                      </div>

                      {/* Current Mode Display */}
                      <div className="mb-3 sm:mb-4 p-2 bg-teal-50 border border-teal-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-teal-800">
                          📸 Current Mode: <span className="font-bold text-teal-900">
                            {cameraState.mode === 'environment' ? '🌍 Environment' : '📱 Selfie'}
                          </span>
                        </p>
                        <p className="text-xs text-teal-700 mt-1">
                          Tap the buttons above to switch camera modes
                        </p>
                      </div>

                      {/* Camera Permission Status */}
                      {cameraState.permission === 'pending' && (
                        <div className="mb-3 sm:mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-xs sm:text-sm">📷 Requesting camera permission...</p>
                          <p className="text-yellow-700 text-xs mt-1">Please allow camera access when prompted</p>
                        </div>
                      )}

                      {cameraState.permission === 'denied' && (
                        <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-xs sm:text-sm">❌ Camera permission denied</p>
                          <p className="text-red-700 text-xs mt-1">Please enable camera access in your browser settings and try again</p>
                        </div>
                      )}

                      {/* Video Stream - Mobile Optimized */}
                      {cameraState.isOpen && (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-w-lg mx-auto rounded-lg border-2 border-gray-300 shadow-lg"
                          />
                          {cameraState.permission === 'granted' && (
                            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
                              <button
                                onClick={captureImage}
                                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation"
                              >
                                📸 Capture Photo
                              </button>
                              <button
                                onClick={closeCamera}
                                className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                
                  {cameraState.capturedImage && (
                    <div className="text-center">
                      <img
                        src={cameraState.capturedImage}
                        alt="Captured"
                        className="w-full max-w-lg mx-auto rounded-lg border-2 border-gray-300 shadow-lg"
                      />
                      
                      {/* Location and Time Information */}
                      {isLoadingLocation && (
                        <div className="mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-blue-800 text-xs sm:text-sm">📍 Getting location data...</p>
                          <p className="text-blue-700 text-xs mt-1">Please allow location access when prompted</p>
                        </div>
                      )}
                      
                                                                     {locationData && (
                          <LocationDisplay 
                            latitude={locationData.latitude} 
                            longitude={locationData.longitude}
                            captureMode={cameraState.mode as 'environment' | 'selfie'}
                            onLocationDetailsReady={setLocationDetails}
                            onPreciseLocationReady={setPreciseLocation}
                          />
                        )}
                      
                      {/* Upload Status Indicator */}
                      {isUploading && (
                        <div className="mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <p className="text-blue-800 text-xs sm:text-sm">☁️ Uploading to Cloudinary...</p>
                          </div>
                          <p className="text-blue-700 text-xs mt-1">Please wait while we process your image</p>
                        </div>
                      )}
                      
                      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <button
                          onClick={submitImage}
                          disabled={isUploading}
                          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation ${
                            isUploading 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                          }`}
                        >
                          {isUploading ? '☁️ Uploading to Cloudinary...' : '✅ Submit for Verification'}
                        </button>
                                                 <button
                           onClick={() => {
                             setCameraState(prev => ({ ...prev, capturedImage: null }));
                             setLocationData(null);
                             setLocationDetails(null);
                             setPreciseLocation('');
                           }}
                          disabled={isUploading}
                          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation ${
                            isUploading 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          🔄 Retake
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                {/* Guidelines - Mobile Optimized */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center">
                    <span className="mr-2">📋</span>
                    Image Guidelines
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <h4 className="font-semibold text-green-800 text-xs sm:text-sm mb-2 flex items-center">
                        <span className="mr-1">✅</span>
                        What to Capture
                      </h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Mangrove planting activities</li>
                        <li>• Beach cleanup operations</li>
                        <li>• Coastal restoration work</li>
                        <li>• Marine life conservation</li>
                        <li>• Water quality monitoring</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <h4 className="font-semibold text-blue-800 text-xs sm:text-sm mb-2 flex items-center">
                        <span className="mr-1">📸</span>
                        Photography Tips
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Ensure good lighting (natural daylight preferred)</li>
                        <li>• Keep camera steady for clear images</li>
                        <li>• Include recognizable landmarks or GPS coordinates</li>
                        <li>• Show the scale of conservation work</li>
                        <li>• Capture before/after shots when possible</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <h4 className="font-semibold text-orange-800 text-xs sm:text-sm mb-2 flex items-center">
                        <span className="mr-1">⚠️</span>
                        Important Notes
                      </h4>
                      <ul className="text-xs text-orange-700 space-y-1">
                        <li>• Images must be taken at actual conservation sites</li>
                        <li>• Include date and location information</li>
                        <li>• Avoid heavily edited or filtered images</li>
                        <li>• Respect local wildlife and ecosystems</li>
                        <li>• Follow safety guidelines in coastal areas</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <h4 className="font-semibold text-purple-800 text-xs sm:text-sm mb-2 flex items-center">
                        <span className="mr-1">🎯</span>
                        Verification Process
                      </h4>
                      <ul className="text-xs text-purple-700 space-y-1">
                        <li>• AI analyzes image authenticity</li>
                        <li>• Satellite data cross-verification</li>
                        <li>• Location validation via GPS</li>
                        <li>• Manual review for complex cases</li>
                        <li>• Points awarded upon successful verification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          

          {/* Main Content Grid - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-4">
            {/* Top Row - 3 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Quick Stats - Mobile Optimized */}
          <section className="mb-3 sm:mb-4">
            <div className="grid grid-rows-3 gap-2 sm:gap-3">
              <StatsCard 
                title="Total Verifications" 
                value={statsData.totalVerification} 
                icon="✅" 
                trend="" 
                trendColor="text-green-600" 
                isLoading={isLoadingStats}
              />
              <StatsCard 
                title="Success Rate" 
                value={typeof statsData.successRate === "number" && !isNaN(statsData.successRate) ? statsData.successRate : 0} 
                icon="📊" 
                trend="" 
                trendColor="text-emerald-600" 
                isLoading={isLoadingStats}
              />
              <StatsCard 
                title="Points Awarded" 
                value={statsData.pointsAwarded} 
                icon="🏆" 
                trend="" 
                trendColor="text-purple-600" 
                isLoading={isLoadingStats}
              />
            </div>
          </section>
              {/* Top Contributions */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2">🏆</span>
                  Recent Contributions
                </h3>
                
                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-gray-100 pr-2">
                  <div className="space-y-2">
                    {isLoadingContributors ? (
                      // Show skeleton loading for contributions
                      Array.from({ length: 5 }).map((_, index) => (
                        <ContributionCardSkeleton key={`contribution-skeleton-${index}`} />
                      ))
                                         ) : topContribution.length > 0 ? (
                       topContribution.map((contribution, index) => {
                         const cacheKey = `${contribution.location.latitude.toFixed(4)},${contribution.location.longitude.toFixed(4)}`;
                         const locationDetails = locationDataMap.get(cacheKey);
                         
                         return (
                           <ContributionCard 
                             key={`contribution-${contribution.imageId || index}`} 
                             contribution={contribution} 
                             index={index}
                             locationDetails={locationDetails}
                             isLoadingLocation={isLoadingLocations}
                           />
                         );
                       })
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No contributions yet. Start by capturing your first image!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges System */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2">🎖️</span>
                  Badge System
                </h3>
                
                <div className="space-y-2">
                  {isLoadingBadges ? (
                                         // Show skeleton loading for badges
                     Array.from({ length: 4 }).map((_, index) => (
                       <BadgeCardSkeleton key={`badge-skeleton-${index}`} />
                     ))
                  ) : badges.length > 0 ? (
                                         badges.map((badge, index) => (
                       <div key={`badge-${badge.name || index}`} className={`flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg transition-all duration-300 hover:shadow-md border hover:scale-102`}>
                        <div className="text-base sm:text-lg">{badge.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">{badge.name}</p>
                          <p className="text-xs text-gray-600">{badge.requirement}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No badges available yet. Keep contributing to earn badges!
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

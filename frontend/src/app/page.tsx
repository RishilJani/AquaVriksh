"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// LocationDisplay component for on-demand address calculation
const LocationDisplay = ({ 
  latitude, 
  longitude, 
  captureMode 
}: { 
  latitude: number; 
  longitude: number; 
  captureMode: 'environment' | 'selfie'; 
}) => {
  const [addressDetails, setAddressDetails] = useState<{
    district: string;
    state: string;
    country: string;
  } | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [timestamp] = useState(new Date());

  // Get address details on component mount
  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=10`
        );
        
        if (!response.ok) {
          throw new Error('Geocoding service unavailable');
        }
        
        const data = await response.json();
        const address = data.address;
        
        setAddressDetails({
          district: address?.city || address?.town || address?.county || address?.district || 'Unknown',
          state: address?.state || address?.province || 'Unknown',
          country: address?.country || 'Unknown'
        });
      } catch (error) {
        console.warn('Geocoding failed:', error);
        setAddressDetails({
          district: 'Unknown',
          state: 'Unknown',
          country: 'Unknown'
        });
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddressDetails();
  }, [latitude, longitude]);

  // Helper functions
  const getTimeOfDay = (date: Date): string => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200">
      <h3 className="font-bold text-teal-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
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
                  <p className="font-semibold text-teal-900 text-xs sm:text-sm">{addressDetails?.district}</p>
                  <p className="text-teal-700 text-xs">{addressDetails?.state}, {addressDetails?.country}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-teal-600">📍</span>
            <div>
              <p className="text-teal-700 text-xs">
                Lat: {latitude.toFixed(6)}
              </p>
              <p className="text-teal-700 text-xs">
                Long: {longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-teal-600">📅</span>
            <div>
              <p className="font-semibold text-teal-900 text-xs sm:text-sm">{formatDate(timestamp)}</p>
              <p className="text-teal-700 text-xs">{getTimeOfDay(timestamp)} • {formatTime(timestamp)}</p>
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
};

export default function Home() {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [captureMode, setCaptureMode] = useState<'environment' | 'selfie'>('environment');
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    totalVerifications: 0,
    activeContributors: 0,
    successRate: 0,
    pointsAwarded: 0
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Navigation functions
  const navigateToLeaderboard = () => {
    router.push('/leaderboard');
  };

  const navigateToBadges = () => {
    router.push('/badges');
  };

  // Ensure video element is ready when camera opens
  useEffect(() => {
    if (isCameraOpen && videoRef.current) {
      console.log('Video element is ready:', videoRef.current);
    }
  }, [isCameraOpen]);

  // Get location data (only coordinates for database efficiency)
  const getLocationData = async (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'Unknown location error occurred.';
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Get address details from coordinates (calculated on-demand)
  const getAddressDetails = async (latitude: number, longitude: number): Promise<{
    district: string;
    state: string;
    country: string;
  }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=10`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      const address = data.address;
      
      return {
        district: address?.city || address?.town || address?.county || address?.district || 'Unknown',
        state: address?.state || address?.province || 'Unknown',
        country: address?.country || 'Unknown'
      };
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return {
        district: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      };
    }
  };

  // Get current timestamp
  const getCurrentTimestamp = (): Date => {
    return new Date();
  };

  // Get time of day
  const getTimeOfDay = (date: Date): string => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Request camera permission and open camera
  const openCamera = async () => {
    try {
      console.log('=== OPENING CAMERA ===');
      console.log('Current state:', { capturedImage, isCameraOpen, cameraPermission });
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }
      
      // Set camera state first to render video element
      setCameraPermission('pending');
      setIsCameraOpen(true);
      setCaptureMode('environment'); // Set initial mode
      
      console.log('Camera state set to open, waiting for video element to render...');
      
      // Wait for video element to be rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Video ref status after render:', { videoRef: videoRef.current });
      
      // Try environment mode first
      try {
        console.log('Trying environment camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment'
          } 
        });
        
        console.log('Environment camera stream obtained:', stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCaptureMode('environment');
          setCameraPermission('granted');
          console.log('Environment camera opened successfully');
        } else {
          throw new Error('Video element not available after render');
        }
      } catch (environmentError) {
        console.log('Environment camera not available, trying selfie mode...', environmentError);
        
        // Fallback to selfie mode if environment mode fails
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user'
            } 
          });
          
          console.log('Selfie camera stream obtained:', stream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCaptureMode('selfie');
            setCameraPermission('granted');
            console.log('Selfie camera opened successfully');
          } else {
            throw new Error('Video element not available after render');
          }
        } catch (selfieError) {
          console.error('Both camera modes failed:', selfieError);
          throw new Error('No camera available');
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission('denied');
      setIsCameraOpen(false);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Unable to access camera: ${errorMessage}. Please check permissions and try again.`);
    }
  };

  // Switch camera mode
  const switchCameraMode = async () => {
    if (!isCameraOpen) return;
    
    const newMode = captureMode === 'environment' ? 'selfie' : 'environment';
    console.log(`Switching camera mode from ${captureMode} to ${newMode}`);
    setCaptureMode(newMode);
    
    // Stop current stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Start new stream with different facing mode
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: newMode === 'environment' ? 'environment' : 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log(`Successfully switched to ${newMode} mode`);
      }
    } catch (err) {
      console.error('Error switching camera mode:', err);
      alert(`Unable to switch to ${newMode} mode. Please try again.`);
      // Revert to previous mode
      setCaptureMode(captureMode);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCameraPermission('pending');
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        closeCamera();
        
        // Get location data after capturing image
        setIsLoadingLocation(true);
        try {
          const location = await getLocationData();
          setLocationData(location);
        } catch (error) {
          console.error('Error getting location:', error);
          alert('Unable to get location data. Please ensure location permissions are granted.');
        } finally {
          setIsLoadingLocation(false);
        }
      }
    }
  };

  const submitImage = () => {
    if (capturedImage && locationData) {
      // Here you would typically send the image and coordinates to your backend for verification
      // Only storing latitude and longitude to reduce database load
      const submissionData = {
        image: capturedImage,
        coordinates: {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        captureMode: captureMode,
        timestamp: new Date()
      };
      
      console.log('Submitting image for verification...', submissionData);
      alert('Image submitted for AI verification! You will receive points once verified.');
      setCapturedImage(null);
      setLocationData(null);
    }
  };

  // Animated counter component
  const AnimatedCounter = ({ target, duration = 2000, suffix = '', decimal = 0 }: { target: number; duration?: number; suffix?: string; decimal?: number }) => {
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
  };

  // Stats data
  const statsData = {
    totalVerifications: 2847,
    activeContributors: 1234,
    successRate: 94.2,
    pointsAwarded: 28450
  };

  const topContributors = [
    { name: 'Sarah Johnson', points: 2840, level: 'Eco Warrior', avatar: '👩‍🔬', verifiedReports: 156 },
    { name: 'Mike Chen', points: 2150, level: 'Green Guardian', avatar: '👨‍💻', verifiedReports: 98 },
    { name: 'Priya Patel', points: 1890, level: 'Seed Planter', avatar: '👩‍🌾', verifiedReports: 67 },
    { name: 'David Kim', points: 1650, level: 'Seed Planter', avatar: '👨‍🔬', verifiedReports: 45 }
  ];

  const recentVerifications = [
    { id: '1', user: 'Sarah Johnson', location: 'Mumbai, India', status: 'verified', points: '+10', time: '2 min ago' },
    { id: '2', user: 'Mike Chen', location: 'Sundarbans, Bangladesh', status: 'verified', points: '+10', time: '5 min ago' },
    { id: '3', user: 'Priya Patel', location: 'Kerala, India', status: 'rejected', points: '-5', time: '8 min ago' },
    { id: '4', user: 'David Kim', location: 'Andaman Islands', status: 'verified', points: '+10', time: '12 min ago' }
  ];

  const badges = [
    { name: 'Seed Planter', icon: '🌱', requirement: '0-500 points', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Green Guardian', icon: '🌿', requirement: '501-1500 points', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { name: 'Eco Warrior', icon: '🌳', requirement: '1501+ points', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    { name: 'Mangrove Master', icon: '🌊', requirement: '100 verified reports', color: 'bg-blue-100 text-blue-800 border-blue-300' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex">
      <Sidebar 
        activeSection="dashboard" 
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
          onMenuClick={toggleSidebar} 
          showSidebarButton={!isSidebarOpen}
          onSidebarOpen={toggleSidebar}
        />
        
                 <div className="p-2 sm:p-3">
                     {/* Compact Hero Section */}
           <section className="mb-4">
             <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-3 sm:p-4 text-white relative overflow-hidden shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
               <div className="relative z-10">
                 <div className="flex items-center mb-2 sm:mb-3">
                   <div className="text-xl sm:text-2xl mr-2 sm:mr-3">🌊🌱</div>
                   <h1 className="text-2xl sm:text-3xl font-bold">
                     AquaVriksh
                   </h1>
                 </div>
                 <p className="text-base sm:text-lg mb-2 sm:mb-3 opacity-95">
                   Gamify Coastal Conservation
                 </p>
                 <p className="text-xs sm:text-sm mb-3 sm:mb-4 opacity-90">
                   Track your contributions, earn points through AI verification, and climb the leaderboard while protecting our coastal ecosystems.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                   <button 
                     onClick={navigateToLeaderboard}
                     className="bg-white text-teal-600 hover:bg-gray-50 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border-2 border-teal-200 hover:border-teal-400"
                   >
                     🏆 View Leaderboard
                   </button>
                   <button 
                     onClick={navigateToBadges}
                     className="border-2 border-white text-white hover:bg-white hover:text-teal-600 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105"
                   >
                     🎖️ View Badges
                   </button>
                 </div>
               </div>
             </div>
           </section>

                     {/* Image Upload Section */}
           <section className="mb-4">
             <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
               <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                 <span className="mr-2">📸</span>
                 Capture Coastal Conservation
               </h2>
              
                             {/* Image Capture Area - Full Width */}
               <div className="mb-4 sm:mb-6">
                 <div 
                   className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-all duration-300"
                   onClick={() => {
                     console.log('Camera area clicked!', { capturedImage, isCameraOpen });
                     if (!capturedImage && !isCameraOpen) {
                       console.log('Opening camera...');
                       openCamera();
                     }
                   }}
                 >
                   {!capturedImage && !isCameraOpen && (
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
                 
                                   {isCameraOpen && (
                    <div className="text-center">
                      {/* Camera Mode Toggle - Always Visible */}
                      <div className="mb-3 sm:mb-4 flex justify-center">
                        <div className="bg-white rounded-lg p-1 shadow-lg border-2 border-teal-200">
                          <button
                            onClick={switchCameraMode}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                              captureMode === 'environment' 
                                ? 'bg-teal-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-teal-600'
                            }`}
                          >
                            🌍 Environment
                          </button>
                          <button
                            onClick={switchCameraMode}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                              captureMode === 'selfie' 
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
                            {captureMode === 'environment' ? '🌍 Environment' : '📱 Selfie'}
                          </span>
                        </p>
                        <p className="text-xs text-teal-700 mt-1">
                          Tap the buttons above to switch camera modes
                        </p>
                      </div>

                                           {/* Camera Permission Status */}
                      {cameraPermission === 'pending' && (
                        <div className="mb-3 sm:mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-xs sm:text-sm">📷 Requesting camera permission...</p>
                          <p className="text-yellow-700 text-xs mt-1">Please allow camera access when prompted</p>
                        </div>
                      )}

                      {cameraPermission === 'denied' && (
                        <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-xs sm:text-sm">❌ Camera permission denied</p>
                          <p className="text-red-700 text-xs mt-1">Please enable camera access in your browser settings and try again</p>
                        </div>
                      )}

                                             {/* Video Stream - Always render when camera is open */}
                       {isCameraOpen && (
                         <>
                           <video
                             ref={videoRef}
                             autoPlay
                             playsInline
                             muted
                             className="w-full max-w-lg mx-auto rounded-lg border-2 border-gray-300 shadow-lg"
                             onLoadedMetadata={() => {
                               console.log('Video metadata loaded successfully');
                             }}
                             onError={(e) => {
                               console.error('Video error:', e);
                             }}
                           />
                           {cameraPermission === 'granted' && (
                             <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:space-x-4">
                               <button
                                 onClick={captureImage}
                                 className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
                               >
                                 📸 Capture Photo
                               </button>
                               <button
                                 onClick={closeCamera}
                                 className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
                               >
                                 ❌ Cancel
                               </button>
                             </div>
                           )}
                         </>
                       )}
                   </div>
                 )}
                 
                                   {capturedImage && (
                    <div className="text-center">
                      <img
                        src={capturedImage}
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
                           captureMode={captureMode}
                         />
                       )}
                      
                      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:space-x-4">
                        <button
                          onClick={submitImage}
                          className="bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                          ✅ Submit for Verification
                        </button>
                        <button
                          onClick={() => {
                            setCapturedImage(null);
                            setLocationData(null);
                          }}
                          className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                          🔄 Retake
                        </button>
                      </div>
                    </div>
                  )}
               </div>
               <canvas ref={canvasRef} className="hidden" />

                             {/* Guidelines - Full Width Row */}
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

                     {/* Compact Quick Stats */}
           <section className="mb-4">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                             <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs text-gray-700 font-medium">Total Verifications</p>
                     <AnimatedCounter target={statsData.totalVerifications} duration={2500} />
                     <p className="text-xs text-green-600 font-medium">+12% this week</p>
                   </div>
                   <div className="text-lg sm:text-xl bg-teal-100 p-1 sm:p-2 rounded-lg">✅</div>
                 </div>
               </div>
                             <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs text-gray-700 font-medium">Active Contributors</p>
                     <AnimatedCounter target={statsData.activeContributors} duration={2000} />
                     <p className="text-xs text-blue-600 font-medium">+8% this week</p>
                   </div>
                   <div className="text-lg sm:text-xl bg-green-100 p-1 sm:p-2 rounded-lg">👥</div>
                 </div>
               </div>
               <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs text-gray-700 font-medium">Success Rate</p>
                     <AnimatedCounter target={statsData.successRate} duration={1800} suffix="%" />
                     <p className="text-xs text-emerald-600 font-medium">+2.1% this week</p>
                   </div>
                   <div className="text-lg sm:text-xl bg-emerald-100 p-1 sm:p-2 rounded-lg">📊</div>
                 </div>
               </div>
               <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs text-gray-700 font-medium">Points Awarded</p>
                     <AnimatedCounter target={statsData.pointsAwarded} duration={3000} />
                     <p className="text-xs text-purple-600 font-medium">+15% this week</p>
                   </div>
                   <div className="text-lg sm:text-xl bg-purple-100 p-1 sm:p-2 rounded-lg">🏆</div>
                 </div>
               </div>
            </div>
          </section>

                     {/* Main Content Grid */}
           <div className="space-y-3 sm:space-y-4">
             {/* Top Row - 3 Column Grid for Sidebar Content */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                             {/* Top Contributors */}
               <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                 <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                   <span className="mr-2">🏆</span>
                   Top Contributors
                 </h3>
                
                                 <div className="space-y-2">
                   {topContributors.map((contributor, index) => (
                     <div key={index} className={`flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-105 ${
                       index === 0 ? 'bg-yellow-50/50 border border-yellow-200' :
                       index === 1 ? 'bg-gray-50/50 border border-gray-200' :
                       index === 2 ? 'bg-orange-50/50 border border-orange-200' :
                       'border border-gray-200 hover:border-teal-300'
                     }`}>
                       <div className="text-base sm:text-lg">{contributor.avatar}</div>
                       <div className="flex-1 min-w-0">
                         <p className="font-semibold text-gray-900 text-xs truncate">{contributor.name}</p>
                         <p className="text-xs text-gray-600">{contributor.level}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-teal-600 text-xs sm:text-sm">{contributor.points}</p>
                         <p className="text-xs text-gray-600">{contributor.verifiedReports} reports</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

                             {/* Badges System */}
               <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                 <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                   <span className="mr-2">🎖️</span>
                   Badge System
                 </h3>
                
                                 <div className="space-y-2">
                   {badges.map((badge, index) => (
                     <div key={index} className={`flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg transition-all duration-300 hover:shadow-md ${badge.color} border hover:scale-105`}>
                       <div className="text-base sm:text-lg">{badge.icon}</div>
                       <div className="flex-1 min-w-0">
                         <p className="font-semibold text-gray-900 text-xs truncate">{badge.name}</p>
                         <p className="text-xs text-gray-600">{badge.requirement}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

                             {/* AI Verification Info */}
               <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-2 sm:p-3 border-2 border-blue-200 shadow-sm transition-all duration-300">
                 <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-2 sm:mb-3 flex items-center">
                   <span className="mr-2">🤖</span>
                   AI Verification
                 </h3>
                
                                 <div className="space-y-2">
                   <div className="flex items-center space-x-2 sm:space-x-3 p-2 bg-white/50 rounded-lg border border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-md">
                     <span className="text-blue-600 text-base sm:text-lg">🔍</span>
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-blue-900 text-xs truncate">Satellite analysis</p>
                       <p className="text-xs text-blue-700">Data verification</p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-2 sm:space-x-3 p-2 bg-white/50 rounded-lg border border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-md">
                     <span className="text-blue-600 text-base sm:text-lg">🖼️</span>
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-blue-900 text-xs truncate">Image check</p>
                       <p className="text-xs text-blue-700">Authenticity verify</p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-2 sm:space-x-3 p-2 bg-white/50 rounded-lg border border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-md">
                     <span className="text-blue-600 text-base sm:text-lg">📍</span>
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-blue-900 text-xs truncate">Location verify</p>
                       <p className="text-xs text-blue-700">GPS validation</p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-2 sm:space-x-3 p-2 bg-white/50 rounded-lg border border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-md">
                     <span className="text-blue-600 text-base sm:text-lg">⚡</span>
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-blue-900 text-xs truncate">Instant results</p>
                       <p className="text-xs text-blue-700">Real-time processing</p>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

                         {/* Bottom Row - Recent Verifications (Full Width) */}
             <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
               {/* Compact Header */}
               <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-2 sm:p-3 text-white">
                 <h2 className="text-base sm:text-lg font-bold flex items-center">
                   <span className="mr-2">⚡</span>
                   Recent Verifications
                 </h2>
               </div>

                             {/* Compact Verifications List */}
               <div className="divide-y divide-gray-100">
                 {recentVerifications.map((verification) => (
                   <div key={verification.id} className="p-2 sm:p-3 transition-all duration-300 hover:bg-teal-50 hover:border-l-4 hover:border-l-teal-400 hover:shadow-md">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                       <div className="flex items-center space-x-2 sm:space-x-3">
                         <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                           <span className="text-white font-bold text-xs">
                             {verification.user.split(' ').map(n => n[0]).join('')}
                           </span>
                         </div>
                         <div>
                           <p className="font-semibold text-gray-900 text-xs sm:text-sm">{verification.user}</p>
                           <p className="text-xs text-gray-600">{verification.location}</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2 sm:space-x-3">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           verification.status === 'verified' 
                             ? 'bg-green-100 text-green-700 border border-green-300' 
                             : 'bg-red-100 text-red-700 border border-red-300'
                         }`}>
                           {verification.status === 'verified' ? '✅ Verified' : '❌ Rejected'}
                         </span>
                         <span className={`font-bold text-sm sm:text-base ${
                           verification.points.startsWith('+') ? 'text-green-600' : 'text-red-600'
                         }`}>
                           {verification.points}
                         </span>
                         <span className="text-xs text-gray-600">{verification.time}</span>
                       </div>
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

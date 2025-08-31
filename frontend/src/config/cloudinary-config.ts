// Simple Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'dvnr3ouix', // Replace with your actual cloud name
  uploadPreset: 'aquavriksh_uploads',
  apiKey: '243333917843149',
  apiSecret: 'BO6zoRXtqhUWJRjmcQe9SCqeGa4',
};

// Upload URL for client-side uploads
export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};

// Simple function to send data to server
export const sendToServer = async (imageUrl: string, locationData: any, userId: string) => {
  try {
    // Encode the userId to handle special characters in email
    const encodedUserId = encodeURIComponent(userId);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/image/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        link: imageUrl,
        longitude: locationData.longitude,
        latitude: locationData.latitude,
        userId: userId,
        timestamp: new Date().toISOString(),
        locationDetails: locationData.locationDetails || null,
        preciseLocation: locationData.preciseLocation || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const res = await response.json();
    
    if (res.data === "done" && res.data.map) {
      return res.data.map;
    } else {
      console.log('Server response not ready:', res);
      return res; // Return the original response if not in expected format
    }
  } catch (error) {
    console.error('Error sending to server:', error);
    throw error;
  }
};

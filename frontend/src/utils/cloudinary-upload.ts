import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl, sendToServer } from '../config/cloudinary-config';

const uploadImage = async (capturedImage: string, locationData: any, userId: string) => {
  try {
    console.log('Starting upload to Cloudinary...');
    
    // Convert base64 to blob
    const base64Response = await fetch(capturedImage);
    const blob = await base64Response.blob();

    // Create FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', blob, 'photo.jpg');
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

    console.log('Uploading to Cloudinary...');
    console.log('Upload URL:', getCloudinaryUploadUrl());
    console.log('Cloud Name:', CLOUDINARY_CONFIG.cloudName);
    console.log('Upload Preset:', CLOUDINARY_CONFIG.uploadPreset);
      
    // Upload to Cloudinary
    const response = await fetch(getCloudinaryUploadUrl(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Failed to upload image to Cloudinary: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const imageUrl = result.secure_url;

    console.log('=== CLOUDINARY UPLOAD SUCCESS ===');
    console.log('Cloudinary Response:', result);
    console.log('Image URL:', imageUrl);
    console.log('========================');

    // Send data to server
    try {
      console.log('Sending data to server...');
      const serverResponse = await sendToServer(
        imageUrl,
        {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        userId
      );
      
      console.log('=== SERVER RESPONSE ===');
      console.log('Server Response:', serverResponse);
      console.log('======================');
      
      return { success: true, imageUrl, serverResponse };
    } catch (serverError) {
      console.error('Server error:', serverError);
      throw new Error('Photo uploaded to Cloudinary but server save failed');
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export { uploadImage };

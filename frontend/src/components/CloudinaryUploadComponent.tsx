import React, { useState } from 'react';
import { uploadImage } from '../utils/cloudinary-upload';

interface CloudinaryUploadComponentProps {
  capturedImage: string | null;
  locationData: any;
  userId: string;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: Error) => void;
}

const CloudinaryUploadComponent: React.FC<CloudinaryUploadComponentProps> = ({
  capturedImage,
  locationData,
  userId,
  onUploadSuccess,
  onUploadError
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (capturedImage && locationData) {
      setIsUploading(true);
      try {
        const result = await uploadImage(capturedImage, locationData, userId);
        alert('✅ Photo uploaded successfully!');
        onUploadSuccess?.(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert('❌ Upload failed: ' + errorMessage);
        onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
      } finally {
        setIsUploading(false);
      }
    } else {
      alert('Please capture a photo and ensure location is available before uploading.');
    }
  };

  return (
    <div>
      <button 
        onClick={handleUpload}
        disabled={isUploading || !capturedImage || !locationData}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
      >
        {isUploading ? '☁️ Uploading to Cloudinary...' : '☁ Upload to Cloudinary'}
      </button>
    </div>
  );
};

export default CloudinaryUploadComponent;

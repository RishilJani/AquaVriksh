# Cloudinary Integration Setup Guide for AquaVriksh

This guide contains all the necessary setup instructions and code to integrate Cloudinary image upload functionality into your AquaVriksh project.

## 📦 Dependencies

The following dependency has been added to your `package.json`:

```json
{
  "dependencies": {
    "cloudinary": "^2.7.0"
  }
}
```

## 🔧 Configuration Files Created

### 1. Cloudinary Configuration (`src/config/cloudinary-config.ts`)

This file contains:
- Cloudinary account credentials
- Upload preset configuration
- Server communication functions

**Current Configuration:**
```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: 'dvnr3ouix',
  uploadPreset: 'aquavriksh_uploads',
  apiKey: '243333917843149',
  apiSecret: 'BO6zoRXtqhUWJRjmcQe9SCqeGa4',
};
```

### 2. Upload Utility (`src/utils/cloudinary-upload.ts`)

This file contains the main upload function that:
- Converts base64 images to blobs
- Uploads to Cloudinary
- Sends data to your server
- Handles errors and logging

### 3. React Component (`src/components/CloudinaryUploadComponent.tsx`)

A reusable React component for Cloudinary uploads with:
- Loading states
- Error handling
- Success callbacks

## 🚀 Integration in Main App

The Cloudinary integration has been added to your main `page.tsx` file:

### Key Changes:
1. **Import added**: `import { uploadImage } from '../utils/cloudinary-upload';`
2. **Upload state**: Added `isUploading` state management
3. **Enhanced submit function**: Now uploads to Cloudinary before server submission
4. **UI improvements**: Loading indicators and disabled states during upload
5. **Error handling**: Comprehensive error messages and user feedback

### Upload Flow:
1. User captures image with camera
2. Location data is automatically captured
3. User clicks "Submit for Verification"
4. Image is uploaded to Cloudinary
5. Cloudinary URL and location data are sent to your server
6. User receives success/error feedback

## ⚙️ Setup Instructions

### 1. Cloudinary Dashboard Setup

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Create a new account or sign in
3. Get your cloud_name, api_key, and api_secret
4. Create an upload preset:
   - Go to Settings → Upload
   - Scroll to Upload presets
   - Create a new upload preset
   - Set signing mode to "Unsigned" for client-side uploads
   - Note the preset name

### 2. Update Configuration

Replace the placeholder values in `src/config/cloudinary-config.ts`:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: 'YOUR_CLOUD_NAME', // Your actual cloud name
  uploadPreset: 'YOUR_UPLOAD_PRESET', // Your upload preset name
  apiKey: 'YOUR_API_KEY', // Your API key
  apiSecret: 'YOUR_API_SECRET', // Your API secret
};
```

### 3. Server Endpoint

Update the server URL in the `sendToServer` function to match your backend endpoint:

```typescript
const response = await fetch(`YOUR_SERVER_URL/image/${userId}`, {
  // ... rest of the code
});
```

## 🔒 Security Notes

- **Never expose API secrets in client-side code** for production
- Use environment variables for sensitive configuration
- Consider implementing server-side upload for better security
- The current setup uses unsigned uploads which are less secure but easier to implement

## 📱 Usage Examples

### Basic Usage in Component:

```typescript
import { uploadImage } from '../utils/cloudinary-upload';

const handleUpload = async () => {
  try {
    const result = await uploadImage(
      capturedImage, 
      locationData, 
      userId
    );
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Using the Upload Component:

```typescript
import CloudinaryUploadComponent from '../components/CloudinaryUploadComponent';

<CloudinaryUploadComponent
  capturedImage={capturedImage}
  locationData={locationData}
  userId={userId}
  onUploadSuccess={(result) => console.log('Success:', result)}
  onUploadError={(error) => console.error('Error:', error)}
/>
```

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your Cloudinary account allows uploads from your domain
2. **Upload Preset Issues**: Make sure the upload preset is set to "Unsigned"
3. **API Key Errors**: Verify your cloud name and upload preset are correct
4. **File Size Limits**: Check Cloudinary's file size limits (default is 100MB)

### Debug Steps:

1. Check browser console for error messages
2. Verify all configuration values are correct
3. Test with a simple image file first
4. Check network tab for failed requests

### Environment Variables (Recommended for Production):

Create a `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Then update the config:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
};
```

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React File Upload Guide](https://cloudinary.com/documentation/react_integration)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)

## ✅ Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to the main page
3. Capture an image using the camera
4. Click "Submit for Verification"
5. Check the browser console for upload logs
6. Verify the image appears in your Cloudinary dashboard

---

*Note*: This integration is designed for client-side uploads. For production applications, consider implementing server-side uploads for better security and control.

# NOMOS AI Netlify Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the NOMOS AI frontend to Netlify with proper backend connectivity via ngrok.

## Prerequisites
- Your backend server running locally (localhost:3001)
- ngrok tunnel active (e.g., `https://55245468afb0.ngrok-free.app`)
- Git repository with your code
- Netlify account

## Step 1: Configure Backend URL
The frontend is pre-configured to use your ngrok URL. Update if needed:

**File: `public/config.js`**
```javascript
backendURL: 'https://55245468afb0.ngrok-free.app'
```

## Step 2: Ensure Backend CORS Configuration
Your backend server must allow CORS from your Netlify domain. Add these headers:

```javascript
// In your backend server (index.js or server.js)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-netlify-domain.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

## Step 3: Deploy to Netlify

### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `echo 'Static deployment ready'`
   - **Publish directory**: `public`
6. Click "Deploy site"

### Option B: Manual Upload
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Select "Deploy manually"
4. Drag and drop the `public` folder
5. Netlify will automatically deploy

## Step 4: Verify Deployment
1. Check your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Open browser console to verify no CORS errors
3. Test the chat functionality

## File Structure for Deployment
```
public/
├── index.html          # Main HTML file
├── app.js             # Frontend application logic
├── client.js          # API client with CORS configuration
├── config.js          # Backend URL configuration
├── styles.css         # Styling
├── _redirects         # SPA routing configuration
└── ...                # Other assets

netlify.toml           # Netlify configuration
```

## Troubleshooting

### CORS Issues
- Ensure your backend has proper CORS headers
- Check that the ngrok URL in `config.js` matches your actual tunnel
- Verify the Netlify domain is allowed in your backend CORS settings

### Connection Errors
- Confirm ngrok is running: `ngrok http 3001`
- Check backend server is running on localhost:3001
- Verify the ngrok URL is accessible directly in browser

### Build Issues
- Ensure `public` folder contains all necessary files
- Check that `netlify.toml` is in the root directory
- Verify no syntax errors in JavaScript files

## Environment Variables (Optional)
For dynamic backend URL configuration, you can use Netlify environment variables:

1. In Netlify dashboard: Site settings → Environment variables
2. Add: `BACKEND_URL=https://your-ngrok-url.ngrok-free.app`
3. Update `config.js` to use: `backendURL: process.env.BACKEND_URL || 'default-url'`

## Quick Checklist
- [ ] Backend server running on localhost:3001
- [ ] ngrok tunnel active
- [ ] CORS configured for Netlify domain
- [ ] Files pushed to GitHub
- [ ] Netlify deployment successful
- [ ] Frontend connects to backend without errors

## Support
If issues persist:
1. Check browser console for specific error messages
2. Verify backend logs for incoming requests
3. Test ngrok URL directly: `curl https://your-ngrok-url.ngrok-free.app/api/health`

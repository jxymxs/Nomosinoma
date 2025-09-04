# CORS Fix Guide for NOMOS AI

## Summary of Changes Made

### 1. Backend CORS Configuration (`index.js`)
- **Fixed Netlify URL**: Removed trailing slash from `https://fanciful-blancmange-063d8c.netlify.app/` to `https://fanciful-blancmange-063d8c.netlify.app`
- **Added specific ngrok URL**: Added `https://f68d23c0db40.ngrok-free.app` to allowed origins
- **Improved regex pattern**: Fixed wildcard pattern matching for ngrok URLs
- **Added ngrok header**: Included `ngrok-skip-browser-warning` in allowed headers
- **Added explicit OPTIONS handler**: Added manual OPTIONS request handling for preflight requests

### 2. Frontend Configuration Updates
- **`public/client.js`**: Updated default ngrok URL to `https://f68d23c0db40.ngrok-free.app`
- **`public/config-fixed.js`**: Updated ngrok URL to match current tunnel

## Testing the Fix

### 1. Start Your Backend Server
```bash
npm start
```

### 2. Ensure ngrok Tunnel is Active
Make sure your ngrok tunnel is running with the correct URL:
```bash
ngrok http 3001
```

### 3. Test CORS Configuration
Run the test script to verify CORS is working:
```bash
node test-cors.js
```

### 4. Test from Browser
Open your browser console on the Netlify site and test:
```javascript
// Test health endpoint
fetch('https://f68d23c0db40.ngrok-free.app/api/health')
  .then(response => response.json())
  .then(data => console.log('Health:', data))
  .catch(error => console.error('Error:', error));

// Test models endpoint
fetch('https://f68d23c0db40.ngrok-free.app/api/models')
  .then(response => response.json())
  .then(data => console.log('Models:', data))
  .catch(error => console.error('Error:', error));
```

## Common Issues and Solutions

### 1. CORS Still Not Working
- **Check ngrok URL**: Ensure the ngrok URL matches exactly what's in your configuration
- **Restart server**: Restart your Express server after making changes
- **Clear browser cache**: Hard refresh (Ctrl+F5) your Netlify site

### 2. ngrok URL Changes
If your ngrok URL changes, update these files:
- `index.js` - Add the new URL to the allowedOrigins array
- `public/config.js` - Update the backendURL
- `public/config-fixed.js` - Update the backendURL
- `public/client.js` - Update the fallback URL in constructor

### 3. Preflight Requests Failing
The explicit OPTIONS handler should handle preflight requests. If issues persist:
- Check browser console for specific error messages
- Verify all required headers are included in the OPTIONS response

## Deployment Checklist

- [ ] Backend server running on port 3001
- [ ] ngrok tunnel active with correct URL
- [ ] CORS test script passes
- [ ] Browser requests work without CORS errors
- [ ] All API endpoints accessible from Netlify frontend

## Troubleshooting

If you still encounter CORS issues:

1. **Check server logs**: Look for "Blocked request from origin" messages
2. **Verify origin matching**: The regex pattern should match your ngrok URL
3. **Test with curl**: 
   ```bash
   curl -H "Origin: https://fanciful-blancmange-063d8c.netlify.app" -I https://f68d23c0db40.ngrok-free.app/api/health
   ```
4. **Check ngrok status**: Ensure your ngrok tunnel is not expired or disconnected

The CORS configuration now includes proper handling for both your Netlify frontend and ngrok backend, with improved pattern matching and preflight request support.

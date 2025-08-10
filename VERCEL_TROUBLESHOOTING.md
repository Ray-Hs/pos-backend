# Vercel Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Serverless Function Crash (500 Error)

**Symptoms:**
- `FUNCTION_INVOCATION_FAILED` error
- 500 Internal Server Error
- Function crashes on startup

**Solutions:**

#### A. Missing Environment Variables
The most common cause is missing required environment variables.

**Required Variables:**
```bash
DATABASE_URL=your_production_database_url
JWT_SECRET_KEY=your_jwt_secret
```

**Set them in Vercel:**
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Add each variable

#### B. Database Connection Issues
- Ensure your database is accessible from Vercel's servers
- Check if your database requires SSL
- Verify the connection string format

**Test Database Connection:**
```bash
# Test locally with production env vars
DATABASE_URL=your_production_url npm run dev
```

#### C. Build Issues
- Check Vercel build logs for TypeScript compilation errors
- Ensure all dependencies are in `package.json`
- Verify `tsconfig.json` is properly configured

### 2. GitHub Actions Errors

**Symptoms:**
- Build fails in GitHub Actions
- Deprecated configuration warnings

**Solutions:**

#### A. Remove Deprecated Configurations
The `functions` configuration in `vercel.json` is deprecated:

```json
// ❌ Remove this
"functions": {
  "api/index.js": {
    "maxDuration": 30
  }
}

// ✅ Keep this
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

#### B. Update Build Commands
Ensure your build script is simple and reliable:

```json
{
  "scripts": {
    "vercel-build": "tsc"
  }
}
```

### 3. Module Resolution Issues

**Symptoms:**
- `ERR_MODULE_NOT_FOUND` errors
- Import/export issues

**Solutions:**

#### A. Use CommonJS for API Entry Point
```javascript
// api/index.js
const express = require('express');
// ... rest of the code
module.exports = app;
```

#### B. Check Import Paths
Ensure all import paths are correct and files exist.

### 4. Environment-Specific Issues

**Development vs Production:**

#### A. CORS Configuration
Update CORS origins for production:

```javascript
const corsOptions = {
  origin: [
    "https://your-frontend-domain.com",
    "http://localhost:3000", // for development
  ],
  credentials: true,
};
```

#### B. Environment Variables
Use different variables for different environments:

```javascript
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = isProduction 
  ? process.env.DATABASE_URL 
  : process.env.DEV_DATABASE_URL;
```

### 5. Debugging Steps

#### A. Check Vercel Logs
1. Go to Vercel dashboard
2. Navigate to your project
3. Click on the latest deployment
4. Check "Functions" tab for error logs

#### B. Test Locally
```bash
# Test with production environment
NODE_ENV=production DATABASE_URL=your_url npm run dev
```

#### C. Verify Environment Variables
```bash
# Check if variables are set
vercel env ls
```

### 6. Performance Issues

#### A. Cold Starts
- Keep dependencies minimal
- Use lightweight packages
- Consider using Edge Functions for simple APIs

#### B. Memory Issues
- Monitor function memory usage
- Optimize imports
- Remove unused dependencies

### 7. Security Issues

#### A. Environment Variables
- Never commit secrets to Git
- Use Vercel's environment variable system
- Rotate secrets regularly

#### B. CORS Configuration
- Only allow necessary origins
- Use HTTPS in production
- Validate input data

### 8. Database Issues

#### A. Connection Pooling
```javascript
// For PostgreSQL
const connectionString = process.env.DATABASE_URL + '?connection_limit=1&pool_timeout=0';
```

#### B. SSL Configuration
```javascript
// For production databases
const ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
```

### 9. Testing Your Deployment

#### A. Health Check
Test your API health endpoint:
```bash
curl https://your-project.vercel.app/api/health
```

#### B. Environment Check
```bash
curl https://your-project.vercel.app/
```

### 10. Getting Help

#### A. Vercel Support
- Check Vercel documentation
- Use Vercel community forums
- Contact Vercel support

#### B. Debugging Tools
- Use Vercel CLI for local testing
- Check function logs in dashboard
- Use browser developer tools

## Quick Fix Checklist

- [ ] Set all required environment variables in Vercel
- [ ] Remove deprecated `functions` configuration from `vercel.json`
- [ ] Test database connection locally with production URL
- [ ] Verify all imports are correct
- [ ] Check CORS configuration for production
- [ ] Ensure build script works locally
- [ ] Test API endpoints after deployment
- [ ] Monitor function logs for errors

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `FUNCTION_INVOCATION_FAILED` | Missing env vars, DB connection | Set environment variables |
| `ERR_MODULE_NOT_FOUND` | Import path issues | Fix import paths |
| `ECONNREFUSED` | Database connection | Check DATABASE_URL |
| `JWT_SECRET_KEY` missing | Auth configuration | Set JWT secret |
| Build timeout | Complex build process | Simplify build script | 
# Vercel Deployment Guide for Restaurant POS API

This guide will help you deploy your restaurant POS backend API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Database**: You'll need a production database (PostgreSQL recommended)
4. **Environment Variables**: Prepare your production environment variables

## Required Environment Variables

Based on your codebase, you'll need to set these environment variables in Vercel:

### Required Variables:
- `DATABASE_URL` - Your production database connection string
- `JWT_SECRET_KEY` - Secret key for JWT token generation/validation

### Optional Variables:
- `NODE_ENV` - Set to "production" (Vercel sets this automatically)
- `PORT` - Vercel handles this automatically
- `HOST` - Vercel handles this automatically
- `API_PREFIX` - Defaults to "/api"
- `BODY_LIMIT` - Defaults to "10mb"
- `COMPRESSION` - Set to "true" to enable compression
- `DATABASE_SSL` - Set to "true" for production databases
- `B2_KEY_ID` - Backblaze B2 access key ID (for file storage)
- `B2_KEY` - Backblaze B2 secret access key (for file storage)
- `BUCKET_NAME` - S3 bucket name (defaults to "restaurant-pos")
- `BASE_URL` - Your production base URL

## Deployment Steps

### 1. Build Your Project Locally

First, ensure your project builds correctly:

```bash
npm run vercel-build
```

This will:
- Generate Prisma client
- Run database migrations
- Compile TypeScript to JavaScript

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set environment variables when prompted

#### Option B: Using Vercel Dashboard

1. **Connect your GitHub repository** to Vercel
2. **Import the project** in Vercel dashboard
3. **Configure environment variables** in the dashboard
4. **Deploy**

### 3. Configure Environment Variables

In your Vercel dashboard or via CLI:

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET_KEY
vercel env add B2_KEY_ID
vercel env add B2_KEY
# Add other variables as needed
```

### 4. Database Setup

1. **Set up a production database** (PostgreSQL recommended)
2. **Run migrations**:
   ```bash
   vercel env pull .env.production.local
   npx prisma migrate deploy
   ```

## Project Structure for Vercel

The deployment uses this structure:
- `api/index.js` - Vercel serverless function entry point
- `public/dist/src/server.js` - Compiled Express app
- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to exclude from deployment

## API Endpoints

Your API will be available at:
- **Production**: `https://your-project.vercel.app/api/*`
- **Preview**: `https://your-project-git-branch.vercel.app/api/*`

## Troubleshooting

### Common Issues:

1. **Build Errors**:
   - Ensure all dependencies are in `package.json`
   - Check that TypeScript compilation succeeds locally

2. **Database Connection**:
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from Vercel's servers
   - Check SSL settings for production databases

3. **Environment Variables**:
   - Verify all required variables are set in Vercel
   - Check variable names match your code

4. **CORS Issues**:
   - Update CORS origins in `src/app.ts` to include your frontend domain

### Debugging:

1. **Check Vercel logs** in the dashboard
2. **Test locally** with production environment variables
3. **Verify database migrations** ran successfully

## Performance Optimization

1. **Database Connection Pooling**: Configure in your `DATABASE_URL`
2. **Caching**: Consider adding Redis for session storage
3. **CDN**: Vercel provides automatic CDN for static assets

## Security Considerations

1. **Environment Variables**: Never commit secrets to your repository
2. **CORS**: Configure allowed origins properly
3. **Rate Limiting**: Already configured in your app
4. **JWT Secrets**: Use strong, unique secrets for production

## Monitoring

1. **Vercel Analytics**: Monitor API performance
2. **Error Tracking**: Consider adding Sentry or similar
3. **Database Monitoring**: Monitor your database performance

## Next Steps

After deployment:
1. Test all API endpoints
2. Update your frontend to use the new API URL
3. Set up monitoring and alerts
4. Configure custom domain if needed

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Express.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/nodejs) 
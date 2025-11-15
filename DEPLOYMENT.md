# Cloudflare Pages Deployment Guide - SVA OAuth Client

This guide walks you through deploying the SVA OAuth Client to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account** - Sign up at [cloudflare.com](https://www.cloudflare.com)
2. **GitHub Repository** - Your code should be in a GitHub repository
3. **Node.js 18+** - Cloudflare Pages will use this for building

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Commit all changes** to your repository:
   ```bash
   git add .
   git commit -m "Prepare for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Verify build works locally**:
   ```bash
   npm run build
   ```
   This should create a `dist` folder with your production build.

### Step 2: Connect Repository to Cloudflare Pages

1. **Log in to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** in the sidebar

2. **Create a New Project**
   - Click **"Create a project"**
   - Click **"Connect to Git"**
   - Authorize Cloudflare to access your GitHub account
   - Select your repository (`sva_oauth_client`)

3. **Configure Build Settings**
   - **Project name**: `sva-oauth-client` (or your preferred name)
   - **Production branch**: `main` (or `master`)
   - **Framework preset**: `Vite` (or leave as "None")
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty if repo root)
   
   ⚠️ **Important**: For Cloudflare Pages with GitHub integration:
   - **Deploy command**: Leave this field **EMPTY** or remove it. Cloudflare Pages handles deployment automatically after the build.
   - **Version command**: Leave this field **EMPTY** or remove it. This is not needed for Pages.
   - Do NOT use `npx wrangler deploy` - that's for Workers, not Pages!

### Step 3: Configure Environment Variables

1. **Go to Project Settings**
   - Click on your project
   - Navigate to **Settings** → **Environment variables**

2. **Add Production Environment Variables**
   Click **"Add variable"** for each:

   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `VITE_API_BASE_URL` | `https://api.getsva.com/api/auth` | Your production OAuth API URL |
   | `VITE_BACKEND_URL` | `https://api.getsva.com` | Your production backend URL |
   | `VITE_FRONTEND_URL` | `https://oauth.getsva.com` | Your Cloudflare Pages domain (for OAuth redirects) |
   | `VITE_API_TIMEOUT` | `30000` | API timeout in milliseconds |
   | `VITE_APP_NAME` | `SVA OAuth Client` | Application name |
   | `VITE_APP_VERSION` | `1.0.0` | Application version |
   | `VITE_ENABLE_DEBUG_LOGS` | `false` | Disable debug logs in production |
   | `VITE_ENABLE_ANALYTICS` | `true` | Enable analytics in production |

   **Optional Variables:**
   - `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID (if not configured in backend)
   - `VITE_GITHUB_CLIENT_ID` - GitHub OAuth client ID (if not configured in backend)

3. **Add Preview Environment Variables** (Optional)
   - Click **"Add variable"** again
   - Select **"Preview"** environment
   - Add the same variables with development values:
     - `VITE_API_BASE_URL`: `http://localhost:8001/api/auth`
     - `VITE_BACKEND_URL`: `http://localhost:8001`
     - `VITE_FRONTEND_URL`: `http://localhost:8081`
     - `VITE_ENABLE_DEBUG_LOGS`: `true`

### Step 4: Configure Custom Domain (Optional)

1. **Go to Custom domains**
   - In your project settings, click **"Custom domains"**
   - Click **"Set up a custom domain"**
   - Enter your domain (e.g., `oauth.getsva.com`)
   - Follow the DNS configuration instructions

2. **SSL/TLS**
   - Cloudflare automatically provides SSL certificates
   - Ensure SSL/TLS encryption mode is set to **"Full"** or **"Full (strict)"**

### Step 5: Deploy

You have **two options** for deployment:

#### Option A: Automatic Deployment via GitHub (Recommended)

1. **Automatic Deployment**
   - Cloudflare Pages will automatically build and deploy when you push to your main branch
   - You can trigger a manual deployment by clicking **"Retry deployment"**

2. **Monitor Build**
   - Go to **Deployments** tab
   - Watch the build logs in real-time
   - Wait for the build to complete (usually 2-5 minutes)

3. **Preview Deployments**
   - Every pull request gets a preview deployment
   - Preview URLs are available in the Deployments tab

#### Option B: Manual Deployment via Wrangler CLI

If you prefer to deploy manually using the command line:

1. **Install Wrangler** (if not already installed):
   ```bash
   npm install -g wrangler
   # or
   npm install --save-dev wrangler
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Build your project**:
   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Pages**:
   ```bash
   npx wrangler pages deploy dist --project-name=sva-oauth-client
   ```
   
   **Important**: Use `wrangler pages deploy` (not `wrangler deploy` which is for Workers)

### Step 6: Verify Deployment

1. **Check Your Site**
   - Visit your Cloudflare Pages URL: `https://your-project.pages.dev`
   - Or your custom domain if configured

2. **Test Functionality**
   - Verify API connections work
   - Test OAuth flows (Google/GitHub)
   - Check that all routes work (SPA routing)
   - Verify OAuth redirect URIs are correct

3. **Check Browser Console**
   - Open browser DevTools
   - Verify no errors in console
   - Check Network tab for API calls

## Important: OAuth Redirect URIs

After deployment, make sure to update your OAuth provider settings:

1. **Google OAuth Console**:
   - Add `https://oauth.getsva.com/auth/callback/google` to authorized redirect URIs

2. **GitHub OAuth App**:
   - Add `https://oauth.getsva.com/auth/callback/github` to authorized redirect URIs

3. **Backend Configuration**:
   - Update your backend OAuth app settings with the production redirect URIs

## Build Configuration

The project is configured with:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18 (configured in `cloudflare-pages.json`)

## SPA Routing Configuration

The `public/_redirects` file ensures all routes are handled by `index.html` for client-side routing. This is automatically deployed with your build.

## Troubleshooting

### OAuth Redirect Issues

If OAuth redirects fail:
1. Verify `VITE_FRONTEND_URL` matches your actual domain
2. Check OAuth provider redirect URI settings
3. Ensure backend has correct redirect URIs configured

### Build Fails

1. **Check Build Logs**
   - Go to Deployments → Failed deployment → View build logs
   - Look for error messages

2. **Common Issues**:
   - **Missing dependencies**: Ensure `package.json` has all dependencies
   - **Node version**: Cloudflare uses Node 18 by default
   - **Build timeout**: Large builds may timeout

### Environment Variables Not Working

1. **Verify variable names** start with `VITE_` prefix
2. **Check environment** (Production vs Preview)
3. **Rebuild** after adding variables (they're injected at build time)
4. **Clear cache** and hard refresh browser

## Support

- **Cloudflare Pages Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Vite Deployment Guide**: [vitejs.dev/guide/static-deploy.html](https://vitejs.dev/guide/static-deploy.html)

---

**Last Updated**: 2025-01-15


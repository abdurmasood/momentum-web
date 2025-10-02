# Deployment

## Overview

Momentum is designed for serverless deployment on Vercel, with Neon PostgreSQL as the database provider. The deployment process is optimized for the Next.js 15 App Router with Turbopack.

[REVIEW: Confirm if Vercel is the deployment platform, or add details for other platforms]

## Deployment Platforms

### Vercel (Recommended)

**Why Vercel**:
- ✅ Built by Next.js creators (optimal support)
- ✅ Zero-config deployment for Next.js
- ✅ Automatic HTTPS with custom domains
- ✅ Edge Network (global CDN)
- ✅ Preview deployments for pull requests
- ✅ Environment variable management
- ✅ Built-in analytics and monitoring

**Vercel Plans**:
- **Hobby** - Free (personal projects)
- **Pro** - $20/mo (production apps)
- **Enterprise** - Custom pricing

[REVIEW: Which plan is currently used?]

### Alternative Platforms

[REVIEW: Document if any of these are supported]

**AWS (via SST or Serverless Framework)**:
- More control over infrastructure
- Potentially lower costs at scale
- Requires more DevOps knowledge

**Railway**:
- Simple deployment like Vercel
- Includes database hosting
- Flat pricing model

**DigitalOcean App Platform**:
- Simple serverless deployment
- Competitive pricing
- Good for smaller teams

**Self-Hosted (Docker)**:
- Full control
- Requires server management
- Best for enterprise with DevOps team

## Vercel Deployment Setup

### Initial Setup

**1. Install Vercel CLI**:
```bash
npm install -g vercel
```

**2. Login to Vercel**:
```bash
vercel login
```

**3. Link Project**:
```bash
vercel link
```

Follow prompts to:
- Select or create Vercel project
- Link to Git repository
- Configure project settings

**4. Add Environment Variables** (Vercel Dashboard):

Navigate to: Project Settings → Environment Variables

**Required Variables**:
```bash
# Authentication
NEXTAUTH_SECRET=your-production-secret-32-chars-minimum
NEXTAUTH_URL=https://yourdomain.com
JWT_SECRET=your-jwt-secret-32-chars-minimum

# Database (from Neon dashboard)
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@host.region.aws.neon.tech/dbname?sslmode=require

# Auth Providers (at least one required)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=Momentum <noreply@yourdomain.com>

# Dashboard URL (production dashboard app)
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.yourdomain.com

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Environment Scopes**:
- **Production** - Production deployments (main branch)
- **Preview** - Pull request previews
- **Development** - Local development (not needed if using `.env`)

**Best Practice**: Set different values for Production vs. Preview (e.g., separate databases)

### Deployment Methods

#### Method 1: Git Push (Recommended)

**Setup**:
1. Connect GitHub/GitLab/Bitbucket in Vercel dashboard
2. Select repository
3. Configure build settings

**Deploy**:
```bash
git push origin main
```

**Automatic Triggers**:
- ✅ Push to `main` → Production deployment
- ✅ Push to other branch → Preview deployment
- ✅ Pull request → Preview deployment with unique URL

**Preview URLs**:
```
https://momentum-git-feature-branch.vercel.app
https://momentum-pr-123.vercel.app
```

#### Method 2: Vercel CLI

**Deploy to Preview**:
```bash
vercel
```

**Deploy to Production**:
```bash
vercel --prod
```

**Specify Environment**:
```bash
vercel --env production
```

#### Method 3: GitHub Actions

[REVIEW: Is GitHub Actions CI/CD configured?]

**Workflow File** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Build Configuration

### Vercel Project Settings

**Location**: Vercel Dashboard → Project Settings → General

**Build & Development Settings**:
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**Node.js Version**: 20.x (Vercel default)

**Root Directory**: `.` (project root)

### Build Optimization

**next.config.mjs** ([next.config.mjs](../next.config.mjs)):

```javascript
const nextConfig = {
  // Turbopack for faster builds
  experimental: {
    optimizePackageImports: ['@paper-design/shaders-react'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Remove X-Powered-By header
  poweredByHeader: false,
}
```

**What Vercel Does**:
- ✅ Runs `npm install` (or `npm ci` in production)
- ✅ Runs `npm run build`
- ✅ Optimizes static assets
- ✅ Generates serverless functions for API routes
- ✅ Deploys to Edge Network (CDN)

### Build Performance

**Typical Build Time**: 1-3 minutes (depends on project size)

**Factors**:
- Dependencies size
- Number of pages/routes
- Static asset optimization
- Turbopack vs. Webpack (Turbopack is faster)

**Build Logs**: Available in Vercel dashboard under Deployments → Build Logs

## Database Setup for Production

### Neon Production Database

**1. Create Production Database**:
- Go to [Neon Console](https://console.neon.tech)
- Create new project (or use existing)
- Name: `momentum-production`
- Region: Choose closest to your users [REVIEW: Which region?]

**2. Get Connection Strings**:
- Navigate to project dashboard
- Copy **Pooled connection** → `DATABASE_URL`
- Copy **Direct connection** → `DIRECT_URL`

**3. Add to Vercel Environment Variables**:
- Vercel Dashboard → Environment Variables
- Add `DATABASE_URL` and `DIRECT_URL`
- Scope: Production only

**4. Run Migrations** (if using Prisma Migrate):
```bash
# From local machine with production DATABASE_URL
npx prisma migrate deploy
```

**Or use schema push** (simpler, for early development):
```bash
npx prisma db push
```

**Database Branching** (Neon feature):
- Create branch from production for testing
- Test schema changes on branch
- Merge to production when ready

### Database Security

**Connection Security**:
- ✅ SSL required (`sslmode=require`)
- ✅ Connection pooling (Neon built-in)
- ✅ IP allowlisting (optional, Neon dashboard)

**Access Control**:
- ✅ Database credentials in Vercel environment variables (encrypted)
- ✅ Never commit credentials to git
- ✅ Rotate credentials periodically [REVIEW: Is this automated?]

**Backup Strategy**:
- ✅ Neon automatic backups (retention based on plan)
- ✅ Point-in-time recovery available
- ⚠️ Consider manual backups for critical data

[REVIEW: Document backup schedule and retention policy]

## Domain Configuration

### Custom Domain Setup

**1. Add Domain in Vercel**:
- Project Settings → Domains
- Add domain: `yourdomain.com` and `www.yourdomain.com`

**2. Configure DNS** (at your domain registrar):

**Option A: Vercel Nameservers** (recommended):
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: CNAME Record**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Option C: A Record** (apex domain):
```
Type: A
Name: @
Value: 76.76.21.21
```

**3. Wait for DNS Propagation** (up to 48 hours, usually < 1 hour)

**4. Verify HTTPS**:
- Vercel automatically provisions SSL certificate (Let's Encrypt)
- Forces HTTPS redirects

### Subdomain for Dashboard

**Dashboard App Domain**: `dashboard.yourdomain.com`

**Setup**:
1. Deploy dashboard app to Vercel (separate project)
2. Add `dashboard.yourdomain.com` to dashboard project
3. Configure DNS (CNAME to dashboard app)
4. Update `NEXT_PUBLIC_DASHBOARD_URL` environment variable

**Cross-Domain Authentication**:
- JWT tokens passed via URL parameter
- Both apps must use same `JWT_SECRET`
- Consider cookie sharing [REVIEW: Is this implemented?]

## Vercel Rewrites

**Configuration**: [vercel.json](../vercel.json)

```json
{
  "rewrites": [
    {
      "source": "/dashboard/:path*",
      "destination": "https://momentum-dashboard.vercel.app/dashboard/:path*"
    }
  ]
}
```

**Purpose**: Proxy `/dashboard/*` requests to dashboard app

**Benefits**:
- Single domain for users
- Transparent routing
- Simplifies authentication flow

**Note**: Update `destination` URL to your production dashboard deployment

## Environment Management

### Environment Tiers

**1. Development** (local):
- `.env` file (gitignored)
- Local database or Neon development branch
- Debug logging enabled
- Hot reload, fast refresh

**2. Preview** (Vercel):
- Separate Neon database (or branch)
- Preview environment variables
- Deployed on PR creation
- Unique URL per deployment

**3. Production** (Vercel):
- Production Neon database
- Production environment variables
- Deployed from `main` branch
- Custom domain

### Environment Variables Best Practices

**Security**:
- ✅ Never commit `.env` to git (add to `.gitignore`)
- ✅ Use Vercel's encrypted environment variable storage
- ✅ Rotate secrets regularly (especially after team member leaves)
- ✅ Use different secrets for preview vs. production

**Organization**:
- ✅ Document all variables in `.env.example`
- ✅ Group by category (auth, database, external services)
- ✅ Include comments explaining purpose

**Validation**:
- ✅ Runtime validation in `src/lib/env.ts`
- ✅ Fails fast if variables missing
- ✅ Clear error messages

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured in Vercel
- [ ] Google OAuth redirect URIs updated (production URL)
- [ ] Resend domain verified (if using email auth)
- [ ] Production database created and migrated
- [ ] Dashboard app deployed and `NEXT_PUBLIC_DASHBOARD_URL` updated
- [ ] Custom domain configured
- [ ] SSL certificate provisioned (automatic via Vercel)
- [ ] Tests passing (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Code committed to `main` branch

### Post-Deployment

- [ ] Visit production URL, verify homepage loads
- [ ] Test Google OAuth login flow
- [ ] Test email magic link flow
- [ ] Verify redirect to dashboard works
- [ ] Check database for new user records
- [ ] Test signout flow
- [ ] Verify custom domain works (https://yourdomain.com)
- [ ] Check Vercel deployment logs for errors
- [ ] Monitor error tracking (if configured)
- [ ] Verify analytics tracking (if configured)

### Ongoing Monitoring

- [ ] Check Vercel Analytics dashboard
- [ ] Monitor database usage in Neon dashboard
- [ ] Review error logs weekly
- [ ] Check email delivery in Resend dashboard
- [ ] Monitor build times (optimize if > 3 minutes)

[REVIEW: Add specific monitoring tools/dashboards]

## Rollback Strategy

### Vercel Instant Rollback

**1. Via Dashboard**:
- Deployments → Find previous deployment
- Click "..." → Promote to Production

**2. Via CLI**:
```bash
vercel rollback
```

**What Happens**:
- ✅ Instant rollback (< 1 minute)
- ✅ No rebuild required
- ✅ DNS already propagated (same IP)

### Database Rollback

**If Schema Changed**:
1. Neon Point-in-Time Recovery (restore to before migration)
2. Or run reverse migration manually

**If Data Changed**:
1. Restore from Neon backup
2. Or manual data correction

**Best Practice**: Test schema changes on Neon branch first

## CI/CD Pipeline

[REVIEW: Document CI/CD setup if implemented]

**Recommended Pipeline**:

```
Code Push
    ↓
GitHub Actions (or Vercel CI)
    ↓
1. Install Dependencies
    ↓
2. Run Linter (ESLint)
    ↓
3. Run Tests (Jest)
    ↓
4. Type Check (TypeScript)
    ↓
5. Build (npm run build)
    ↓
6. Deploy to Vercel
    ↓
7. Run E2E Tests (optional)
    ↓
8. Notify Team (Slack, Discord)
```

**Example GitHub Action** (`.github/workflows/ci.yml`):
```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## Performance Optimization

### Build Optimization

**Bundle Analysis**:
```bash
npm run analyze
```

**Optimization Targets**:
- Total bundle size < 200KB (gzipped)
- First Load JS < 100KB
- No duplicate dependencies

**Techniques**:
- ✅ Code splitting (automatic in Next.js)
- ✅ Dynamic imports for large components
- ✅ Image optimization (next/image)
- ✅ Font optimization (next/font)

### Runtime Optimization

**Vercel Edge Network**:
- Static assets cached globally
- Serverless functions deployed to multiple regions
- Automatic scaling

**Database Optimization**:
- Use Neon connection pooling
- Index frequently queried fields
- Optimize Prisma queries (avoid N+1)

**Monitoring** [REVIEW: Add specific tools]:
- Vercel Analytics (Core Web Vitals)
- Sentry (error tracking)
- LogRocket (session replay)

### Caching Strategy

**Vercel Automatic Caching**:
- Static pages cached indefinitely
- API routes cached based on headers
- Images cached and optimized

**Custom Caching** (if needed):
```typescript
// In API route
export const revalidate = 3600  // Cache for 1 hour
```

## Security Hardening

### Production Security Checklist

- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Environment variables encrypted
- [ ] Secrets rotated (NEXTAUTH_SECRET, JWT_SECRET)
- [ ] CORS headers configured (if needed)
- [ ] Rate limiting enabled [REVIEW: Is this implemented?]
- [ ] Security headers configured [REVIEW: See next.config.mjs]
- [ ] Dependencies updated (no known vulnerabilities)
- [ ] Database backups enabled
- [ ] Error messages don't expose internal details

**Security Headers** (add to `next.config.mjs`):
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ]
}
```

### Dependency Security

**Check for Vulnerabilities**:
```bash
npm audit
```

**Fix Vulnerabilities**:
```bash
npm audit fix
```

**Update Dependencies**:
```bash
npm update
```

**Automated Updates** (Dependabot):
- Enable in GitHub repository settings
- Automatically creates PRs for updates

## Troubleshooting Deployment

### Common Issues

**Build Fails**:
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Test `npm run build` locally
- Check TypeScript errors

**Environment Variables Not Loading**:
- Verify variables set in Vercel dashboard
- Check scope (Production/Preview/Development)
- Redeploy after adding new variables
- Verify variable names (no typos)

**Database Connection Errors**:
- Verify `DATABASE_URL` format
- Check Neon database is not paused
- Test connection locally with production URL
- Verify SSL mode (`sslmode=require`)

**OAuth Redirect Mismatch**:
- Update Google Cloud Console redirect URIs
- Production URL: `https://yourdomain.com/api/auth/callback/google`
- Preview URL: Add Vercel preview domain to allowed URIs (or use separate OAuth app)

**Email Delivery Failures**:
- Verify Resend domain in Resend dashboard
- Check DNS records (SPF, DKIM, DMARC)
- Verify `EMAIL_FROM` matches verified domain
- Check Resend API key is valid

**Deployment Timeout**:
- Build takes > 10 minutes (Vercel limit on Hobby plan)
- Optimize dependencies
- Use Turbopack (faster builds)
- Consider upgrading Vercel plan

### Debug Tools

**Vercel Logs**:
```bash
vercel logs production
```

**Real-time Logs**:
```bash
vercel logs --follow
```

**Function Logs** (specific API route):
- Vercel Dashboard → Deployments → Function Logs

**Database Logs**:
- Neon Dashboard → Monitoring → Query Performance

## Scaling Considerations

### Traffic Scaling

**Vercel Auto-Scaling**:
- Automatic for serverless functions
- No configuration needed
- Scales to zero when idle

**Limits** (Vercel Hobby Plan):
- 100GB bandwidth/month
- 100 serverless function executions/hour
- 10 seconds function timeout

**Limits** (Vercel Pro Plan):
- 1TB bandwidth/month
- Unlimited function executions
- 60 seconds function timeout

[REVIEW: Which plan are you on? When to upgrade?]

### Database Scaling

**Neon Autoscaling**:
- Automatically scales compute based on load
- Scales to zero when idle (cost savings)
- Connection pooling handles high concurrent connections

**Monitoring**:
- Check Neon dashboard for usage metrics
- Set up alerts for high usage
- Consider upgrading plan if hitting limits

### Cost Optimization

**Vercel Costs**:
- Hobby: Free (personal projects)
- Pro: $20/mo (production apps)
- Additional: Bandwidth, function invocations (Pro plan)

**Neon Costs**:
- Free tier: 0.5 GB storage, limited compute
- Pro: $19/mo (more storage, compute)

**Cost Reduction Tips**:
- Use Neon autoscaling (pay only for usage)
- Optimize images (reduce bandwidth)
- Cache API responses (reduce function calls)
- Monitor usage dashboards

## Disaster Recovery

### Backup Strategy

**Database Backups**:
- Neon automatic backups (retention based on plan)
- Manual backups via `pg_dump` weekly
- Store backups in S3 or similar

**Code Backups**:
- Git repository (GitHub/GitLab)
- Multiple deployment history in Vercel

**Configuration Backups**:
- Export environment variables periodically
- Document all Vercel project settings
- Keep local `.env.example` updated

### Recovery Plan

**Database Corruption**:
1. Restore from Neon point-in-time recovery
2. Or restore from manual backup
3. Verify data integrity
4. Resume operations

**Code Issues**:
1. Rollback to previous Vercel deployment
2. Or git revert to stable commit
3. Redeploy
4. Verify functionality

**Complete Outage** (Vercel down):
1. Check Vercel status page
2. Wait for resolution (usually < 30 minutes)
3. Or deploy to backup platform (AWS, Railway)

[REVIEW: Document actual disaster recovery plan, RTO/RPO targets]

---

*Last Updated: January 2025*
*Version: 1.0.0*

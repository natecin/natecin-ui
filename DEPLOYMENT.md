# NATECIN Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

Vercel provides the best hosting for Next.js applications with zero configuration.

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NATECIN frontend"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

   That's it! Vercel will automatically:
   - Detect Next.js configuration
   - Install dependencies
   - Build the project
   - Deploy to a production URL

3. **Custom Domain (Optional)**
   - In Vercel dashboard, go to project settings
   - Add your custom domain
   - Update DNS records as instructed

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t natecin:latest .

# Run container
docker run -p 3000:3000 natecin:latest
```

## 📦 Self-Hosting with PM2

For traditional VPS hosting:

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "natecin" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## ☁️ Other Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway up
```

### AWS Amplify

1. Connect your GitHub repository
2. Select main branch
3. Build settings are auto-detected
4. Deploy

## 🔐 Environment Variables

For production, set these environment variables:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Web3 (when integrated)
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🔍 Pre-Deployment Checklist

- [ ] Run `npm run build` locally to verify
- [ ] Test on multiple devices/browsers
- [ ] Verify all images and fonts load
- [ ] Check console for errors
- [ ] Test all interactive elements
- [ ] Verify responsive design
- [ ] Test navigation between pages
- [ ] Check loading states
- [ ] Verify SEO metadata
- [ ] Test performance with Lighthouse

## 📊 Performance Optimization

Already implemented:
- ✅ Next.js automatic code splitting
- ✅ Image optimization (Next.js Image component ready)
- ✅ Font optimization (Google Fonts via next/font)
- ✅ Turbopack build optimization
- ✅ CSS minification
- ✅ Tree shaking

Additional optimizations:
- Use `next/image` for all images
- Enable ISR (Incremental Static Regeneration) for dynamic content
- Add service worker for offline capability
- Implement edge caching with Vercel Edge Functions

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 Debugging Production Issues

### Enable Debug Mode

```bash
# For Next.js debugging
DEBUG=* npm start

# Check build output
npm run build -- --debug
```

### Common Issues

1. **Build Errors**
   - Check Node.js version (18+ required)
   - Clear `.next` folder and rebuild
   - Verify all dependencies are installed

2. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS
   - Verify fonts are loading

3. **Performance Issues**
   - Use Next.js Image component
   - Enable caching headers
   - Implement lazy loading

## 📈 Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in, zero-config
- **Google Analytics**: For user tracking
- **Sentry**: For error tracking
- **Lighthouse CI**: For performance monitoring

### Setup Sentry (Optional)

```bash
npm install @sentry/nextjs

# Follow prompts
npx @sentry/wizard@latest -i nextjs
```

## 🔒 Security Considerations

- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set secure headers in `next.config.js`
- [ ] Implement rate limiting for API routes
- [ ] Add CORS configuration if needed
- [ ] Regular dependency updates
- [ ] Enable Content Security Policy

## 🌐 CDN Configuration

Vercel automatically provides:
- Global CDN distribution
- Automatic SSL certificates
- DDoS protection
- Edge caching

For custom CDN:
- Configure Cloudflare in front of origin
- Set appropriate cache headers
- Enable Brotli compression

## 📱 Progressive Web App (Future)

To convert to PWA:

1. Add `next-pwa` package
2. Create `manifest.json`
3. Add service worker
4. Configure in `next.config.js`

```bash
npm install next-pwa
```

## 🎯 Post-Deployment

1. **Verify deployment**
   - Visit production URL
   - Test all features
   - Check mobile responsiveness

2. **Set up monitoring**
   - Configure analytics
   - Set up error tracking
   - Monitor performance metrics

3. **Document**
   - Note production URL
   - Document any configuration changes
   - Update team on deployment

## 📞 Support

For deployment issues:
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Tailwind CSS: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Your NATECIN application is ready to go live! 🚀**

# 🚀 Deployment Guide - Anime Draft Arena

## Quick Deploy Checklist

- [ ] Tests pass locally
- [ ] Build compiles without errors
- [ ] Environment variables configured
- [ ] Database (if added) is set up
- [ ] Custom domain is ready
- [ ] SSL/TLS certificate obtained
- [ ] Rate limiting configured
- [ ] CORS origins whitelisted

---

## Option 1: Deploy to Heroku (Easiest)

### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed
- Git repository initialized

### Steps

1. **Create Heroku App**
```bash
heroku create your-app-name
```

2. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

3. **Deploy**
```bash
git push heroku main
```

4. **View Logs**
```bash
heroku logs -t
```

5. **Access App**
```
https://your-app-name.herokuapp.com
```

### Heroku Procfile
Create `Procfile` in root:
```
web: npm start
```

---

## Option 2: Deploy to Railway

### Prerequisites
- Railway account (pay-as-you-go)
- GitHub repository

### Steps

1. **Connect GitHub**
   - Go to railway.app
   - New Project
   - Choose GitHub repository

2. **Configure Service**
   - Auto-detects Node.js
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Set Environment Variables**
   - NODE_ENV: production
   - PORT: (auto-assigned)

4. **Deploy**
   - Push to main branch
   - Auto-deploys

---

## Option 3: Deploy to AWS (EC2)

### Prerequisites
- AWS account
- EC2 instance (Ubuntu 20.04+)
- Domain & SSL certificate

### Steps

1. **Create EC2 Instance**
   - t2.micro (free tier eligible)
   - Open ports: 80, 443, 3000

2. **SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Clone Repository**
```bash
git clone https://github.com/yourname/drafter.git
cd drafter
```

5. **Install Dependencies**
```bash
npm install
cd client && npm install && cd ..
```

6. **Build Application**
```bash
npm run build
cd client && npm run build && cd ..
```

7. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

8. **Start Application**
```bash
pm2 start npm --name "anime-draft" -- start
pm2 startup
pm2 save
```

9. **Install Nginx (Reverse Proxy)**
```bash
sudo apt-get install -y nginx
```

10. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/default
```

Replace content with:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

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

11. **Enable Nginx**
```bash
sudo systemctl restart nginx
```

12. **Add SSL (Let's Encrypt)**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Option 4: Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY package*.json ./
RUN npm install

# Copy backend source
COPY src ./src
COPY tsconfig.json ./

# Copy frontend
COPY client ./client
WORKDIR /app/client
RUN npm install && npm run build

WORKDIR /app

# Build backend
RUN npm run build

# Clean up
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
```

### Create docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    restart: unless-stopped
```

### Deploy
```bash
docker-compose up -d
```

---

## Option 5: Vercel (Frontend) + Railway (Backend)

### Deploy Frontend to Vercel

1. **GitHub Connection**
   - Go to vercel.com
   - Import GitHub repository
   - Select `client` as root directory

2. **Build Settings**
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Environment Variables**
   - None needed (uses localhost during dev)

### Deploy Backend to Railway

1. **Follow "Option 2: Railway" above**

2. **Update Frontend Socket Connection**

In `client/src/context/SocketContext.tsx`:
```typescript
const newSocket = io(
  process.env.NODE_ENV === 'production'
    ? 'https://your-railway-app.up.railway.app'
    : window.location.origin,
  {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  }
)
```

3. **Rebuild & Redeploy**

---

## Production Configuration

### Environment Variables

Create `.env` file (never commit):
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Enable CORS in Production

In `src/index.ts`:
```typescript
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

### Add Rate Limiting

Install express-rate-limit:
```bash
npm install express-rate-limit
```

In `src/index.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### Add Helmet (Security Headers)

Install helmet:
```bash
npm install helmet
```

In `src/index.ts`:
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## Monitoring & Maintenance

### Monitor Uptime
- **Uptime Robot** (free tier): uptime robot.com
- **StatusPage.io**: track & communicate status

### Monitor Logs
- **Heroku**: `heroku logs -t`
- **Railway**: Dashboard logs
- **AWS**: CloudWatch
- **Docker**: `docker logs container-name`

### Monitor Performance
- **New Relic** (free tier)
- **Datadog** (free tier)
- **Grafana** (self-hosted)

### Database Backups (if added)
- Automated daily backups
- Testing restore procedure
- Off-site backup storage

---

## Scaling Tips

### Prepare for Growth

1. **Horizontal Scaling** (multiple server instances)
   - Use load balancer (AWS ELB, Heroku, Railway)
   - Socket.IO adapter for multiple processes
   ```bash
   npm install @socket.io/redis-adapter
   ```

2. **Caching**
   - Add Redis for session storage
   - Cache frequent queries

3. **Database**
   - Move from in-memory to persistent database
   - Add indexing on frequently queried fields

4. **CDN**
   - Serve static assets from CDN
   - Cloudflare free tier works great

---

## Troubleshooting Deployment

### Socket.IO Connection Fails
- Check CORS configuration
- Verify WebSocket port is open
- Check firewall rules
- Review logs for errors

### Build Fails
```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

### Performance Issues
- Check server CPU/memory
- Review Socket.IO connection count
- Look for memory leaks
- Profile with Node.js profiler

### Database Issues
- Check connection string
- Verify database is running
- Check authentication credentials

---

## Before Going Live

- [ ] Update CORS origin in code
- [ ] Enable HTTPS/WSS
- [ ] Set proper environment variables
- [ ] Configure database (if using)
- [ ] Enable logging
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test with multiple concurrent players
- [ ] Load test the server
- [ ] Security audit:
  - [ ] No hardcoded secrets
  - [ ] Rate limiting enabled
  - [ ] Input validation enabled
  - [ ] CORS restricted
  - [ ] Helmet headers enabled

---

## Post-Deployment

1. **Monitor first 24 hours closely**
2. **Have rollback plan ready**
3. **Set up alerts for:
   - Server down
   - High error rate
   - Memory leak
   - Connection issues

4. **Schedule:**
   - Daily log review (first week)
   - Weekly performance check
   - Monthly backup verification

---

## Cost Estimates (Monthly)

| Platform | Cost | Notes |
|----------|------|-------|
| Heroku | $7-50 | Hobby: $7, Standard: $25 |
| Railway | $5-100+ | Pay-as-you-go |
| AWS | $0-50+ | Free tier eligible, can scale |
| Vercel | Free | Frontend only |
| DigitalOcean | $4-24+ | VPS starting at $4 |
| Render | Free-$7+ | Free tier available |

---

## Support

For detailed deployment help:
- Check platform documentation
- Review logs first
- Test locally to reproduce
- Contact platform support

---

**Ready to deploy?** Choose your platform and follow the steps above! 🚀

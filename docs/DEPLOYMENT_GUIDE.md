# BY Solutions — Production Deployment & Operations Guide

This document outlines the operational architecture, deployment procedures, and maintenance workflows for the BY Solutions website and backend API.

---

## 1. System Topology

```text
                                Internet (Users & Clients)
                                            │
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │              DNS & CDN Layer              │
                      │         (Cloudflare / Custom DNS)         │
                      └─────────────────────┬─────────────────────┘
                                            │
                   ┌────────────────────────┴────────────────────────┐
                   │                                                 │
                   ▼                                                 ▼
     ┌───────────────────────────┐                     ┌───────────────────────────┐
     │      Static Frontend      │                     │     Node.js Express API   │
     │  (Vercel / Netlify / GH)  │                     │ (Render / Railway / VPS)  │
     │                           │                     │                           │
     │  - frontend/index.html    │                     │  - PORT (dynamic)         │
     │  - frontend/css/styles.css│                     │  - Helmet security headers│
     │  - frontend/js/main.js    │   POST /api/contact │  - Rate limiter (5/15min) │
     │  - frontend/images/...    ├────────────────────►│  - Express validator     │
     └───────────────────────────┘                     └─────────────┬─────────────┘
                                                                     │
                                             ┌───────────────────────┴───────────────────────┐
                                             ▼                                               ▼
                              ┌─────────────────────────────┐                 ┌─────────────────────────────┐
                              │     MongoDB Atlas Cluster   │                 │     Zoho Mail SMTP Server   │
                              │ (Collection: bysolutions)   │                 │       (smtp.zoho.in:465)    │
                              └─────────────────────────────┘                 └─────────────────────────────┘
```

---

## 2. Directory Structure

```text
bysolutions-static/
├── .gitignore                   # Global ignore rules for secrets, dependencies, logs, and OS caches
├── README.md                    # Primary developer documentation & setup manual
│
├── docs/                        # Architecture & operational guides
│   └── DEPLOYMENT_GUIDE.md      # This operations manual
│
├── frontend/                    # Client-side static application
│   ├── index.html               # Main website landing page
│   ├── css/
│   │   └── styles.css           # Custom design system, typography & layouts
│   ├── js/
│   │   └── main.js              # Client interactions, carousels & async API form handler
│   └── images/
│       ├── about/               # About section imagery
│       ├── branding/            # BY Solutions official logo
│       ├── hero/                # Datacenter and infrastructure hero banners
│       ├── partners/            # Partner logos (Microsoft, Dell, Cisco, AWS, etc.)
│       └── services/            # Solution visual banners
│
└── backend/                     # Node.js / Express.js REST API
    ├── config/
    │   └── db.js                # MongoDB connection lifecycle & DNS resolver setup
    ├── middleware/
    │   ├── errorHandler.js      # Global error masking & logging
    │   ├── rateLimiter.js       # IP-based rate limiting
    │   └── validateContact.js   # Input validation rules & service allowlist
    ├── models/
    │   └── Contact.js           # Mongoose document schema
    ├── routes/
    │   └── contactRoutes.js     # Form submission endpoints
    ├── utils/
    │   └── sendEmail.js         # Zoho SMTP notification & confirmation dispatch
    ├── .env                     # Local secrets (NEVER committed to Git)
    ├── .env.example             # Safe template with placeholder values
    ├── .gitignore               # Backend-specific ignore rules
    ├── index.js                 # Server entry point & graceful shutdown
    ├── package.json             # NPM package manifest
    └── package-lock.json        # Deterministic dependency lockfile
```

---

## 3. Production Deployment Procedures

### Step 1: Deploy Backend API
1. Create a new Web Service on **Render** (or Railway / Fly.io / VPS).
2. Connect your GitHub repository: `https://github.com/VanshMt/Bysolutions-Webiste`.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node index.js`.
6. Configure Environment Variables in the platform dashboard:
   - `MONGO_URI`: Your production MongoDB Atlas connection string.
   - `EMAIL_USER`: Zoho SMTP sending address (`sales@bysolutions.in`).
   - `EMAIL_PASS`: Zoho SMTP application-specific password.
   - `COMPANY_EMAIL`: Internal notification recipient address (`sales@bysolutions.in`).
   - `FRONTEND_URL`: Production frontend URL (`https://bysolutions.in`).
   - `NODE_ENV`: `production`.
7. Verify backend health endpoint once deployed:
   `https://<your-backend-domain>/api/health` → `HTTP 200` `{"success":true,"message":"BY Solutions API is running"}`.

### Step 2: Deploy Frontend Static Website
1. Create a new Static Site on **Vercel** (or Netlify / Cloudflare Pages).
2. Connect the GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Set **Build Command** to none (or leave blank).
5. Set **Output Directory** to `.` (or root of `frontend`).
6. Custom Domain: Configure DNS records (CNAME/A) to point `bysolutions.in` and `www.bysolutions.in` to your static host.

### Step 3: Wire Frontend to Production Backend
1. In `frontend/js/main.js`, update the API endpoint (line ~363):
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:5000'
     : 'https://<your-production-backend-domain>';

   const response = await fetch(`${API_BASE_URL}/api/contact`, {
   ```
2. Commit and push the updated `frontend/js/main.js`.

---

## 4. Operational Maintenance & Monitoring

- **Health Checks**: Monitor `GET /api/health` with an automated uptime monitor (e.g., UptimeRobot, BetterStack) to ensure API availability.
- **Log Inspection**: Server logs show incoming MongoDB reconnection events and email errors without exposing user credentials.
- **Rate Limit Adjustments**: The contact endpoint enforces a maximum of 5 submissions per 15-minute window per IP in `backend/middleware/rateLimiter.js`. Adjust `windowMs` and `limit` if enterprise proxy environments require different throughput.

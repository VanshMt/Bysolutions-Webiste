# BY Solutions — Enterprise IT Infrastructure & Cloud Solutions

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-brightgreen)](https://nodejs.org/)
[![Database: MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)](https://www.mongodb.com/atlas)
[![Email: Zoho SMTP](https://img.shields.io/badge/Email-Zoho%20SMTP-orange)](https://www.zoho.com/mail/)

Repository: [https://github.com/VanshMt/Bysolutions-Webiste](https://github.com/VanshMt/Bysolutions-Webiste)

---

## 1. Project Overview

**BY Solutions** is an enterprise IT infrastructure provider, systems integrator, and cloud solutions partner delivering end-to-end IT hardware, hybrid cloud migrations, cybersecurity UTM firewalls, enterprise networking, software licensing, and certified refurbished IT equipment.

This repository contains the complete production-ready source code for the redesigned BY Solutions website, including:
- A high-performance, responsive **Frontend** built with vanilla web technologies, CSS Custom Properties design system, and modern typography.
- A secure, decoupled **Backend API** built with Express.js and MongoDB Atlas, featuring strict validation, rate limiting, and automated Zoho SMTP email notifications.

---

## 2. Tech Stack

### Frontend
- **Markup**: Semantic HTML5 with accessibility attributes and OpenGraph metadata.
- **Styling**: Vanilla CSS3 using custom CSS variables (design tokens), flexbox, CSS grid, and responsive media queries.
- **Interactions**: Vanilla JavaScript (ES6+) for interactive carousels, mobile navigation, FAQ accordions, and asynchronous contact form submission.
- **Iconography & Fonts**: Font Awesome 6 Free, Google Fonts (*Plus Jakarta Sans* & *Inter*).

### Backend
- **Runtime & Framework**: Node.js (v18+ / v20+), Express.js (v5).
- **Database**: MongoDB Atlas via Mongoose (v9).
- **Email Service**: Nodemailer over secure SSL (`smtp.zoho.in:465`).
- **Security & Reliability**:
  - `helmet`: Sets HTTP security headers (HSTS, CSP, XSS filtering, frameguard).
  - `cors`: Restricts API access to authorized frontend origins.
  - `express-rate-limit`: Prevents brute force and abuse (5 requests / 15 minutes per IP).
  - `express-validator`: Enforces strict input validation, length bounds, email normalization, and service allowlisting.
  - Safe HTML escaping on all email template outputs to prevent HTML/XSS injection.

---

## 3. Repository & Directory Structure

The repository is structured as a decoupled monorepo, allowing frontend and backend to be developed together locally and deployed independently in production:

```text
bysolutions-static/
├── .gitignore                      # Root Git ignore rules (secrets, dependencies, logs, OS files)
├── README.md                       # Comprehensive architecture and deployment guide
│
├── backend/                        # Express.js REST API
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection & DNS resolver configuration
│   ├── middleware/
│   │   ├── errorHandler.js         # Centralized HTTP error handler (safe client responses)
│   │   ├── rateLimiter.js          # IP-based rate limiting (5 submissions / 15 min)
│   │   └── validateContact.js      # Input validation rules & service allowlist
│   ├── models/
│   │   └── Contact.js              # Mongoose schema for inquiries and quote requests
│   ├── routes/
│   │   └── contactRoutes.js        # Contact and quote API endpoints
│   ├── utils/
│   │   └── sendEmail.js            # Zoho SMTP transporter & HTML-escaped email templates
│   ├── .env                        # Local secrets (NEVER committed - excluded by .gitignore)
│   ├── .env.example                # Safe environment variable template with placeholders
│   ├── .gitignore                  # Backend-level Git ignore rules
│   ├── index.js                    # Express application entry point & graceful shutdown
│   ├── package.json                # Backend dependencies and scripts
│   └── package-lock.json           # Exact dependency lockfile
│
└── frontend/                       # Client-side static website
    ├── css/
    │   └── styles_1.css            # Primary stylesheet (design system, layouts, dark theme)
    ├── images/                     # Optimized visual assets
    │   ├── branding/               # Logos and favicons
    │   ├── hero/                   # High-resolution datacenter hero imagery
    │   ├── partners/               # Authorized partner badges (Microsoft, Dell, Cisco, etc.)
    │   └── services/               # Solution visual banners
    ├── index/
    │   └── index_1.html            # Main landing page markup
    └── js/
        └── main_1.js               # Client-side form handler, navigation, and UI animations
```

---

## 4. Local Development Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x, v20.x, or v22.x LTS)
- [npm](https://www.npmjs.com/) (v9+)
- Python 3 (or VS Code Live Server / any static HTTP file server)
- Active MongoDB Atlas connection string or local MongoDB instance

### Step 1: Clone the Repository
```bash
git clone https://github.com/VanshMt/Bysolutions-Webiste.git
cd Bysolutions-Webiste
```

### Step 2: Configure Backend Environment Variables
Navigate to the `backend/` directory, copy the template, and configure your secrets:
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and supply valid values for:
- `PORT` (default `5000`)
- `MONGO_URI` (MongoDB connection string)
- `EMAIL_USER` & `EMAIL_PASS` (Zoho Mail SMTP credentials)
- `COMPANY_EMAIL` (Recipient for incoming consultation notifications)
- `FRONTEND_URL` (Frontend origin, default `http://localhost:5500`)

### Step 3: Install Backend Dependencies & Start Server
```bash
npm install
npm start
```
The backend starts at `http://localhost:5000`. You can verify health:
```bash
curl http://localhost:5000/api/health
# Response: {"success":true,"message":"BY Solutions API is running"}
```

### Step 4: Serve the Frontend
In a separate terminal, serve the project root or `frontend` directory on port `5500`:

Using Python:
```bash
# From the repository root (d:\bysolutions-static):
python -m http.server 5500
```
Or using VS Code Live Server:
- Open `frontend/index/index_1.html` and click **Go Live** (port `5500`).

Open your browser to:
`http://localhost:5500/frontend/index/index_1.html`

---

## 5. Environment Variables Reference

All sensitive keys are managed via environment variables. **Never commit `.env` to Git.**

| Variable | Description | Example / Default | Required in Production |
| :--- | :--- | :--- | :---: |
| `PORT` | HTTP port for the Express application | `5000` (auto-assigned on Render/Railway) | Optional |
| `NODE_ENV` | Application environment mode | `production` | Recommended |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `https://bysolutions.in` | **Yes** |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/...` | **Yes** |
| `EMAIL_USER` | Zoho SMTP authenticated sender email | `sales@bysolutions.in` | **Yes** |
| `EMAIL_PASS` | Zoho SMTP application-specific password | `your_app_specific_password` | **Yes** |
| `COMPANY_EMAIL` | Recipient email for lead notifications | `sales@bysolutions.in` | **Yes** |

A sanitized template is maintained in [backend/.env.example](backend/.env.example).

---

## 6. Contact Form Flow & Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User / Customer
    participant Browser as Frontend (main_1.js)
    participant RateLimiter as Rate Limiter (IP)
    participant Validator as Express Validator
    participant DB as MongoDB Atlas
    participant Zoho as Zoho SMTP Server
    actor Sales as BY Solutions Sales Team

    Customer->>Browser: Fills form & clicks "Send Consultation Inquiry"
    Browser->>Browser: Disables button, sets loading spinner
    Browser->>RateLimiter: POST /api/contact (JSON payload)
    alt Rate Limit Exceeded (>5 per 15 min)
        RateLimiter-->>Browser: HTTP 429 Too Many Requests
        Browser-->>Customer: Displays rate-limit error message
    else Allowed
        RateLimiter->>Validator: Pass request to validation rules
    end
    alt Validation Failed (invalid email, disallowed service, etc.)
        Validator-->>Browser: HTTP 400 Bad Request (field errors)
        Browser-->>Customer: Displays validation feedback
    else Validated
        Validator->>DB: Contact.create({ fullName, email, service, ... })
        DB-->>Validator: Document saved with status 'new'
        par Email Operations (Asynchronous & Non-blocking)
            Validator->>Zoho: Send Company Notification (HTML escaped)
            Zoho-->>Sales: Delivery to sales@bysolutions.in
        and
            Validator->>Zoho: Send Customer Confirmation (HTML escaped)
            Zoho-->>Customer: Delivery to customer's email
        end
        Validator-->>Browser: HTTP 201 Created { success: true, data: { id } }
        Browser->>Browser: Resets form, displays green success alert
        Browser-->>Customer: "Thank you! Your inquiry has been submitted."
    end
```

### Supported Services in Allowlist
The dropdown on the frontend and the backend schema enforce the following values:
1. `Enterprise Hardware` (*Enterprise Hardware & Servers*)
2. `Cloud Migration` (*Cloud Services - M365 / Azure / AWS*)
3. `Cybersecurity` (*Cybersecurity & Firewall Protection*)
4. `Networking` (*Enterprise Networking & Wireless*)
5. `Refurbished IT` (*Refurbished Hardware Catalog*)
6. `Other` (*Other IT Consulting*)

---

## 7. Production Deployment Architecture

Because the project is decoupled, the frontend and backend can be hosted on specialized platforms while sharing this single repository:

```text
┌──────────────────────────────────────────┐
│              Custom Domain               │
│          https://bysolutions.in          │
└────────────────────┬─────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Frontend Static │     │   Backend API   │
│   Edge Hosting  │     │  Cloud Service  │
│ (Vercel/Netlify/│     │ (Render/Railway/│
│ Cloudflare/GH)  │     │     Fly.io)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ Fetch API             ├───► MongoDB Atlas
         └───────────────────────┤
                                 └───► Zoho SMTP (SSL:465)
```

### Option A: Frontend on Vercel / Netlify / Cloudflare Pages
- **Root Directory**: `frontend`
- **Build Command**: None (pure static assets)
- **Output Directory**: `.` (or configure rewrite to serve `index/index_1.html` at `/`)
- **Headers / Redirects**: Redirect `/` to `/index/index_1.html` or place a lightweight root router if hosting providers do not support directory nesting natively.

### Option B: Backend on Render / Railway / Fly.io
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Environment Variables**: Add `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `COMPANY_EMAIL`, `FRONTEND_URL`, `NODE_ENV=production`.

---

## 8. Security Implementation

1. **Zero Secret Leakage**:
   - Comprehensive `.gitignore` at both repository root and backend directory.
   - All environment files (`.env*`) excluded from version control.
   - Only dummy placeholders provided in `.env.example`.
2. **Input Sanitization & Validation**:
   - Express-validator strips whitespace, normalizes emails, validates min/max lengths, and strictly checks values against the service allowlist.
   - Request bodies limited to `10kb` (`express.json({ limit: '10kb' })`) to prevent memory exhaustion attacks.
3. **Email Injection Prevention**:
   - All user inputs injected into email templates are passed through an HTML entity escaping function (`&`, `<`, `>`, `"`, `'`).
4. **Abuse Mitigation (DDoS / Spam)**:
   - IP-based rate limiting on `/api/contact` limits users to 5 requests per 15-minute window.
5. **HTTP Headers & CORS**:
   - Helmet enforces strict HTTP response headers.
   - Dynamic CORS verification against whitelisted origins only.
6. **Error Masking**:
   - Centralized error handler logs full error details on the server but returns clean, non-leaking error responses to clients.

---

## 9. Future Production Deployment Checklist

When you are ready to execute the production deployment, follow this sequence:

- [ ] **1. Deploy Backend API**:
  - Deploy `backend/` to your chosen platform (e.g. Render, Railway).
  - Configure environment variables in the cloud dashboard (`MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `COMPANY_EMAIL`, `NODE_ENV=production`).
  - Verify that the cloud backend health check returns HTTP 200 (`https://<your-backend-domain>/api/health`).
- [ ] **2. Deploy Frontend Static Site**:
  - Deploy `frontend/` to your chosen static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).
  - Configure domain routing so the main landing page loads at your custom domain (`https://bysolutions.in`).
- [ ] **3. Update Frontend API Endpoint**:
  - In [frontend/js/main_1.js](frontend/js/main_1.js#L363), change:
    ```javascript
    // Change from:
    const response = await fetch('http://localhost:5000/api/contact', {
    // To your production API URL:
    const response = await fetch('https://<your-backend-domain>/api/contact', {
    ```
- [ ] **4. Update Backend CORS Origin**:
  - In your backend cloud environment dashboard, set:
    ```bash
    FRONTEND_URL=https://bysolutions.in
    ```
  - If both `https://bysolutions.in` and `https://www.bysolutions.in` are used, update `allowedOrigins` in [backend/index.js](backend/index.js#L16-L20) to include both domain variants.
- [ ] **5. Enable Reverse Proxy Trust**:
  - If hosted behind Render/Railway/Cloudflare/Nginx, add `app.set('trust proxy', 1);` before the rate limiter in [backend/index.js](backend/index.js) so client IPs are accurately recorded for rate limiting.
- [ ] **6. Perform Production Smoke Test**:
  - Send one verified production enquiry through the deployed website.
  - Verify MongoDB record creation in the Atlas cluster.
  - Verify email arrival at the sales mailbox and confirmation at the customer inbox.

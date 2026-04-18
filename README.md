# 🚀 PrepMate AI - Personal Interview Coach

A **production-ready** full-stack web application built with MERN stack (MongoDB, Express, React, Node.js), Firebase Authentication, and Groq AI for conducting realistic mock interviews with AI-powered feedback.

**Status**: ✅ Production Ready | **Last Updated**: April 2026

---

## 🎯 Quick Links

- 📖 **[Local Setup Guide](./INSTALLATION.md)** - Get started in 5 minutes
- 🚀 **[Production Deployment](./PRODUCTION_SETUP.md)** - Deploy to Vercel & Render
- 📋 **[Setup Checklist](./SETUP_CHECKLIST.md)** - Before you start
- 🏗️ **[Architecture Guide](#architecture)** - How it's built

---

## ✨ Features

### User Features
- ✅ **Google Sign-In** - Seamless Firebase authentication
- ✅ **Mock Interviews** - Realistic scenario-based interviews
- ✅ **AI-Powered Feedback** - Real-time coaching using Groq AI
- ✅ **Resume Analyzer** - AI identifies skills gaps and strengths
- ✅ **Analytics Dashboard** - Track progress with visualizations
- ✅ **Secure Sessions** - JWT-based session management

### Admin Features
- ✅ **User Management** - Create, read, update, delete users
- ✅ **Role Assignment** - Promote users to admin
- ✅ **System Statistics** - Monitor platform metrics
- ✅ **Interview History** - View all user interviews
- ✅ **Domain Analytics** - See user distribution by domain

### Security & Performance
- ✅ **Rate Limiting** - 3-tier DDoS protection
- ✅ **Input Validation** - Comprehensive Joi schemas
- ✅ **Error Handling** - Global standardized error responses
- ✅ **CORS Protection** - Restricted to frontend domain
- ✅ **Helmet Security** - HTTP headers protection
- ✅ **Graceful Shutdown** - Clean server termination

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Responsive styling |
| **Firebase 9** | Authentication |
| **Axios** | HTTP client with interceptors |
| **Recharts** | Analytics charts |
| **React Router v6** | Client-side routing |
| **Zustand** | State management |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **Node.js** | JavaScript runtime |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM with validation |
| **Firebase Admin SDK** | Server-side auth |
| **Groq SDK** | AI integration |
| **JWT** | Session tokens |
| **Multer** | File uploads |
| **Joi** | Input validation |

---

## 🚀 Getting Started (5 Minutes)

### Step 1: Clone & Install
```bash
# Clone repository
git clone https://github.com/yourusername/prepmate-ai.git
cd prepmate-ai

# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

### Step 2: Configure Environment
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with Firebase, MongoDB, Groq credentials

# Frontend
cd frontend
cp .env.example .env
# Edit .env with Firebase config
```

### Step 3: Start Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev
# Output: ✅ Server running on http://localhost:5000

# Terminal 2: Frontend
cd frontend && npm run dev  
# Output: ➜ Local: http://localhost:5173/
```

### Step 4: Access Application
Open **http://localhost:5173/** in your browser.

**➡️ [Detailed setup in INSTALLATION.md](./INSTALLATION.md)**

---

## 📋 API Documentation

### Authentication
```
POST   /api/auth/login              - Register/login (Firebase ID token)
GET    /api/auth/me                 - Get current user
PUT    /api/auth/profile            - Update profile
POST   /api/auth/refresh-token      - Refresh JWT
DELETE /api/auth/account            - Delete account
```

### User Endpoints
```
GET    /api/users/profile           - Get profile
POST   /api/users/resume/upload     - Upload resume
GET    /api/users/resume            - Get resume metadata
GET    /api/users/resume/analysis   - Get AI analysis
DELETE /api/users/resume            - Delete resume
```

### Analytics
```
GET    /api/analytics/overview      - User stats
GET    /api/analytics/progress      - Progress chart data
GET    /api/analytics/skills        - Skills analysis
```

### Admin (requires admin role)
```
GET    /api/admin/users             - Paginated user list
GET    /api/admin/users/:id         - User stats
DELETE /api/admin/users/:id         - Delete user
PUT    /api/admin/users/:id/role    - Update role
GET    /api/admin/stats             - System stats
```

---

## 🏗️ Architecture

### Authentication Flow
```
Google Sign-In → Firebase ID Token → /api/auth/login 
→ Backend Verification → JWT Session Token → 
All Requests Include JWT
```

### Project Structure
```
prepmate-ai/
├── backend/
│   ├── config/              # Env & service setup
│   │   ├── env.js
│   │   ├── firebaseConfig.js
│   │   └── database.js
│   ├── middleware/          # Request processing
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── models/              # Database schemas
│   ├── services/            # Business logic
│   ├── controllers/         # Route handlers
│   ├── routes/              # API endpoints
│   └── server.js            # Express entry
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API & logic
│   │   ├── context/         # Global state
│   │   ├── config/          # Firebase config
│   │   └── hooks/           # Custom hooks
│   └── vite.config.js
│
├── INSTALLATION.md          # Setup guide
├── PRODUCTION_SETUP.md      # Deployment
└── README.md               # This file
```

---

## 🔐 Security Features

### Backend Security
- **Rate Limiting**: 3-tier (auth: 5/15min, api: 100/15min, strict: 10/1hr)
- **Input Validation**: Joi schemas on all routes
- **Input Sanitization**: Escape all user input
- **CORS**: Restricted to frontend domain only
- **Helmet**: Security HTTP headers
- **JWT Signing**: Configurable expiry
- **Firebase Verification**: Admin SDK token validation
- **Error Handling**: No stack traces in production

### Frontend Security
- **XSS Protection**: React escapes by default
- **HTTPS**: Auto on Vercel
- **Token Storage**: localStorage with lifecycle management
- **CSRF Protection**: Endpoint validation

---

## 🧪 Testing

### Test Authentication
1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Complete Google Sign-In
4. Should redirect to Dashboard

### Test Backend Health
```bash
curl http://localhost:5000/health
# Expected: {"status":"OK","database":"Connected","firebase":"Initialized"}
```

### Test Admin Panel
1. Make user admin in MongoDB:
```bash
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```
2. Logout and login again
3. Click "Admin Panel"

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect at vercel.com/new
3. Set environment variables
4. Deploy

### Backend (Render)
1. Push code to GitHub  
2. New Web Service on render.com
3. Set environment variables
4. Deploy

**➡️ [Full deployment guide in PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)**

### Cost Estimate (Monthly)
| Service | Cost |
|---------|------|
| Vercel | $20 |
| Render | $20-40 |
| MongoDB Atlas | Free |
| Firebase | Free |
| Domain | $10-15 |
| **Total** | **$50-75** |

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Node version (should be v14+)
node --version

# Install dependencies
cd backend && npm install

# Check .env file exists
ls .env

# Check MongoDB connection
# Verify MONGODB_URI in .env
```

### Frontend Won't Load
```bash
# Check dependencies
cd frontend && npm install

# Check .env has Firebase config
npm run dev  # Check console for errors
```

### CORS Error
```bash
# Update backend .env
FRONTEND_URL=http://localhost:5173

# Restart backend server
```

---

## 📚 Documentation

- **[INSTALLATION.md](./INSTALLATION.md)** - Local development setup
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Production deployment
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Pre-launch checklist
- [Express Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Firebase Docs](https://firebase.google.com/docs/)

---

## 📊 Database Schema

### User
```javascript
{
  firebaseId, email, name,
  role: "user" | "admin",
  resume: {fileName, fileUrl, uploadedAt},
  resumeAnalysis: {extractedSkills[], relevantSkills[], missingSkills[], overallScore},
  skillsGap: [{skill, proficiency, priority}],
  loginHistory: [{timestamp, ipAddress, userAgent}]
}
```

### Interview
```javascript
{
  userId, domain, difficulty,
  startTime, endTime, duration,
  score, feedback, improvements[],
  recordingUrl
}
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/prepmate-ai/issues)
- **Email**: support@prepmate.ai
- **Documentation**: [Wiki](https://github.com/yourusername/prepmate-ai/wiki)

---

**Made with 🚀 for Interview Preparation Excellence**

**Last Updated**: April 2026 | **Version**: 1.0.0 | **Status**: ✅ Production Ready

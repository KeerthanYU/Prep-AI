# PrepMate AI - Complete Setup Guide

## Folder Structure
```
prepmate-ai/
├── backend/
│   ├── config/                  # Configuration files (DB, Firebase)
│   ├── controllers/             # Request handlers
│   ├── middleware/              # Custom middleware
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API endpoints
│   ├── services/                # Business logic
│   ├── uploads/                 # Resume storage
│   ├── utils/                   # Helper functions
│   ├── server.js                # Express server entry
│   ├── package.json             # Dependencies
│   └── .env.example             # Environment template
│
└── frontend/
    ├── public/                  # Static assets
    ├── src/
    │   ├── assets/              # Images, icons
    │   ├── components/          # Reusable React components
    │   ├── context/             # React context (Auth, Interview)
    │   ├── hooks/               # Custom React hooks
    │   ├── pages/               # Page components
    │   ├── services/            # API & utility services
    │   ├── utils/               # Helper functions
    │   ├── App.jsx              # Main app component
    │   ├── main.jsx             # React entry point
    │   └── index.css            # Global styles
    ├── vite.config.js           # Vite config
    ├── tailwind.config.js       # Tailwind CSS config
    ├── package.json             # Dependencies
    └── .env.example             # Environment template
```

## Backend Setup

### 1. Environment Variables
Create `.env` in backend folder:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/prepmate-ai
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email
GROQ_API_KEY=your-groq-api-key
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start Server
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

Server runs on http://localhost:5000

## Frontend Setup

### 1. Environment Variables
Create `.env` in frontend folder:
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start Dev Server
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
```

Frontend runs on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register/Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Interviews
- `POST /api/interviews/start` - Start new interview
- `POST /api/interviews/submit-answer` - Submit answer
- `POST /api/interviews/complete` - Complete interview
- `GET /api/interviews/history` - Get interview history
- `GET /api/interviews/:id` - Get interview details
- `GET /api/interviews/stats/dashboard` - Get dashboard stats

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/resume/upload` - Upload resume
- `DELETE /api/users/resume` - Delete resume
- `DELETE /api/users/account` - Delete account

## Key Features Implemented

### Backend
✅ Express server with MongoDB
✅ Firebase authentication
✅ Groq AI integration for question generation & evaluation
✅ Resume upload & management
✅ Interview session management
✅ Score calculation & user statistics
✅ Error handling & validation
✅ CORS & security middleware

### Frontend
✅ React + Vite + Tailwind CSS
✅ Firebase authentication
✅ Multi-page routing
✅ Context API for state management
✅ Chart visualization (Recharts)
✅ Web Speech API (voice recording)
✅ Resume upload component
✅ Interview flow with question handling
✅ Results & feedback display
✅ Responsive design

## Database Schema

### User Model
- Firebase ID, email, display name
- Profile picture, selected domain
- Resume file info
- Interview readiness score
- Total sessions, average score
- Domain strengths (content, communication, confidence)

### Interview Model
- User reference
- Domain, questions count
- Answers array with scores & feedback
- Overall, content, communication, confidence scores
- Status, difficulty, timestamps

### Question Model
- Domain, difficulty level
- Question text, category, skills
- Expected answer outline
- Generated flag for personalization
- Resume context

## Testing Flow

1. **Register/Login** with Firebase
2. **Set Domain** on first visit
3. **Upload Resume** for personalization
4. **Start Interview** - Get 5 AI-generated questions
5. **Answer Questions** - Text or voice
6. **Get Evaluated** - Scores + feedback per answer
7. **View Results** - Dashboard with trends & history

## Production Checklist

- [ ] Set production environment variables
- [ ] Update Firebase security rules
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set up Groq API rate limiting
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Configure custom domain
- [ ] Set up monitoring & logging

## Support & Troubleshooting

**Port already in use?**
```bash
# Backend
lsof -i :5000
kill -9 <PID>

# Frontend  
lsof -i :5173
kill -9 <PID>
```

**MongoDB connection error?**
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network is accessible

**Firebase errors?**
- Check service account credentials
- Verify Firebase project configuration
- Clear cache and reinstall auth

**Groq API errors?**
- Verify API key is correct
- Check rate limits
- Review API documentation

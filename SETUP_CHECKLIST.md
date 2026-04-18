# 🎯 PrepMate AI - Setup Checklist

Complete this checklist to get your PrepMate AI platform running!

---

## Phase 1: External Services (15 minutes)

### Firebase Setup
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable Email/Password authentication
- [ ] Create Web App in Firebase project
- [ ] Download service account JSON
- [ ] Note: Project ID, Private Key, Client Email
- [ ] Note: API Key, Auth Domain, Project ID, Storage Bucket, Sender ID, App ID

### MongoDB Setup
- [ ] Create account at https://www.mongodb.com/cloud/atlas
- [ ] Create free M0 cluster
- [ ] Create database user (username & password)
- [ ] Whitelist your IP address
- [ ] Get connection string (replace password)
- [ ] Copy connection string for later

### Groq API Setup
- [ ] Create account at https://console.groq.com
- [ ] Generate API key
- [ ] Copy API key for later

---

## Phase 2: Backend Configuration (10 minutes)

### Navigate to Backend
- [ ] Open terminal
- [ ] `cd backend`

### Install Dependencies
- [ ] Run `npm install`
- [ ] Wait for completion (~ 2-3 minutes)

### Environment Setup
- [ ] Copy `.env.example` to `.env`: `cp .env.example .env`
- [ ] Open `.env` in editor
- [ ] Fill in values:
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=development`
  - [ ] `MONGODB_URI=` (paste MongoDB connection string)
  - [ ] `FIREBASE_PROJECT_ID=` (from service account)
  - [ ] `FIREBASE_PRIVATE_KEY=` (from service account, keep `\n`)
  - [ ] `FIREBASE_CLIENT_EMAIL=` (from service account)
  - [ ] `GROQ_API_KEY=` (from Groq console)
  - [ ] `FRONTEND_URL=http://localhost:5173`
  - [ ] `JWT_SECRET=any-random-string-here`

### Start Backend
- [ ] Run `npm run dev`
- [ ] Verify output:
  ```
  Server running on port 5000
  MongoDB connected successfully
  Firebase initialized successfully
  ```
- [ ] Backend ready! ✅

---

## Phase 3: Frontend Configuration (10 minutes)

### Open New Terminal
- [ ] In main `prepmate-ai` folder
- [ ] `cd frontend`

### Install Dependencies
- [ ] Run `npm install`
- [ ] Wait for completion

### Environment Setup
- [ ] Copy `.env.example` to `.env`: `cp .env.example .env`
- [ ] Open `.env` in editor
- [ ] Fill in values:
  - [ ] `VITE_API_URL=http://localhost:5000/api`
  - [ ] `VITE_FIREBASE_API_KEY=` (from Firebase Web App)
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN=` (from Firebase)
  - [ ] `VITE_FIREBASE_PROJECT_ID=` (from Firebase)
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET=` (from Firebase)
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID=` (from Firebase)
  - [ ] `VITE_FIREBASE_APP_ID=` (from Firebase)

### Start Frontend
- [ ] Run `npm run dev`
- [ ] Verify output:
  ```
  Local:   http://localhost:5173/
  ```
- [ ] Frontend ready! ✅

---

## Phase 4: Testing (10 minutes)

### Open Browser
- [ ] Go to http://localhost:5173
- [ ] Should see home page with "Get Started" button

### Register Test Account
- [ ] Click "Get Started"
- [ ] Email: `test@example.com`
- [ ] Password: `Test@12345` 
- [ ] Display Name: `Test User`
- [ ] Click "Create Account"
- [ ] Should redirect to dashboard

### Check Dashboard
- [ ] See "Interview Readiness: 0"
- [ ] See empty interview history
- [ ] Verify profile info loaded

### Upload Resume (Optional but recommended)
- [ ] Go to Profile tab
- [ ] Click "Upload Resume"
- [ ] Choose any PDF or DOC file
- [ ] Verify file uploaded

### Start Interview
- [ ] Go to Dashboard
- [ ] Click "Start New Interview"
- [ ] Select domain: "Software Engineering"
- [ ] Click "Start Interview"
- [ ] Should see first question

### Answer Questions
- [ ] Type or record answer for Q1
- [ ] Click "Submit & Next"
- [ ] Should see score and feedback (0-100)
- [ ] Repeat for all 5 questions

### View Results
- [ ] After Q5, click "Complete Interview"
- [ ] Should see results page with:
  - [ ] Overall score
  - [ ] Individual category scores
  - [ ] Feedback
  - [ ] Question review

### Check Dashboard Updated
- [ ] Go back to dashboard
- [ ] Should see:
  - [ ] Updated readiness score
  - [ ] Session in history
  - [ ] Performance chart

---

## Phase 5: Verification (5 minutes)

### Functionality Check
- [ ] Registration works ✅
- [ ] Login works ✅
- [ ] Profile view works ✅
- [ ] Resume upload works ✅
- [ ] Interview flow works ✅
- [ ] Voice recording works (or text answer) ✅
- [ ] Scoring displays ✅
- [ ] Results show feedback ✅
- [ ] Dashboard updates ✅

### Backend Verification
- [ ] No errors in terminal ✅
- [ ] Database queries working ✅
- [ ] Firebase auth working ✅
- [ ] Groq API responding ✅

### Browser Console
- [ ] No errors in developer console ✅
- [ ] API calls successful (Network tab) ✅

---

## Phase 6: Troubleshooting

### If Backend Won't Start
- [ ] [ ] Check `.env` file exists
- [ ] [ ] Verify all required variables filled
- [ ] [ ] Test MongoDB connection
- [ ] [ ] Test Firebase credentials
- [ ] [ ] Check port 5000 not in use
- [ ] [ ] Clear `node_modules` and reinstall

### If Frontend Won't Start
- [ ] [ ] Check `.env` file exists
- [ ] [ ] Verify Firebase variables filled
- [ ] [ ] Check port 5173 not in use
- [ ] [ ] Clear cache: `npm run build` && start again
- [ ] [ ] Check backend is running

### If Interview Won't Start
- [ ] [ ] Verify Groq API key is valid
- [ ] [ ] Check backend logs for errors
- [ ] [ ] Test API endpoint in Postman
- [ ] [ ] Verify MongoDB has interview data

### If Scoring Not Working
- [ ] [ ] Check Groq API logs
- [ ] [ ] Verify API key not rate limited
- [ ] [ ] Restart backend server
- [ ] [ ] Check answer text not empty

### If Voice Not Working
- [ ] [ ] Browser must be Chrome/Firefox/Safari/Edge
- [ ] [ ] Allow microphone permission
- [ ] [ ] Check microphone is connected
- [ ] [ ] Test in Chrome first (most compatible)

---

## Phase 7: Next Steps

### After Successful Testing
- [ ] Read `README.md` for full documentation
- [ ] Explore code structure in each folder
- [ ] Review API documentation
- [ ] Test edge cases and error scenarios
- [ ] Customize styling in `frontend/tailwind.config.js`
- [ ] Add more interview questions to database

### Ready to Deploy?
- [ ] Frontend: Push to GitHub, connect to Vercel
- [ ] Backend: Push to GitHub, connect to Render
- [ ] Update `.env` variables for production
- [ ] Test in production environment

### To Add Features
- [ ] Database migrations (new fields)
- [ ] More question categories
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Payment integration
- [ ] More AI features

---

## Quick Commands Reference

```bash
# Backend
cd backend
npm install           # Install dependencies
npm run dev          # Start with auto-reload
npm start            # Start for production

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev         # Start dev server with HMR
npm run build       # Build for production
npm run preview     # Preview production build

# Utilities
npm test            # Run tests (when available)
ctrl+c              # Stop server
```

---

## Support Resources

| Issue | Resource |
|-------|----------|
| MongoDB | [docs.mongodb.com](https://docs.mongodb.com) |
| Firebase | [firebase.google.com/docs](https://firebase.google.com/docs/auth) |
| Groq API | [console.groq.com](https://console.groq.com) |
| React | [react.dev](https://react.dev) |
| Express | [expressjs.com](https://expressjs.com) |
| Vite | [vitejs.dev](https://vitejs.dev) |

---

## 📞 Troubleshooting Contacts

- **MongoDB Issues**: Check Atlas dashboard, network settings
- **Firebase Issues**: Check Firebase console, authentication settings
- **Groq API Issues**: Check console limits, API key validity
- **Port Issues**: `lsof -i :5000` or `lsof -i :5173`

---

## ✅ Final Checklist

- [ ] All dependencies installed
- [ ] All environment variables configured
- [ ] Backend running on 5000
- [ ] Frontend running on 5173
- [ ] Can register new user
- [ ] Can start interview
- [ ] Can answer questions
- [ ] Can view results
- [ ] No errors in console
- [ ] Ready for development! 🚀

---

## 🎉 You're All Set!

Congratulations! Your PrepMate AI platform is now running locally.

**Start developing:** Make changes to code, save, and see live updates!

**Need help?** Check the documentation files:
- `README.md` - Overview
- `INSTALLATION.md` - Detailed setup
- `API_DOCUMENTATION.md` - API reference
- `QUICK_REFERENCE.md` - Command cheat sheet
- `ARCHITECTURE.md` - System design

---

**Happy Interviewing!** 🚀💻✨

*Created: April 14, 2024*
*Status: Ready for Production*

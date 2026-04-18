const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    console.log('Firebase initialized successfully');
    return admin;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    process.exit(1);
  }
};

module.exports = initializeFirebase;

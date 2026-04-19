const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK with service account credentials.
 * This function is idempotent and safe to call multiple times.
 */
function initializeFirebase() {
  if (admin.apps.length) return admin;

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    throw new Error('Missing Firebase credentials in environment variables');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✓ Firebase Admin SDK initialized successfully');
  return admin;
}

async function verifyToken(token) {
  if (!admin.apps.length) throw new Error('Firebase Admin SDK not initialized');
  return admin.auth().verifyIdToken(token);
}

initializeFirebase();

async function getFirebaseUser(uid) {
  if (!admin.apps.length) throw new Error('Firebase Admin SDK not initialized');
  return admin.auth().getUser(uid);
}

module.exports = {
  initializeFirebase,
  admin,
  verifyToken,
  getFirebaseUser,
};


import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import apiService from './apiService';

class AuthService {
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName,
        });
      }

      // Register user in backend
      const token = await userCredential.user.getIdToken();
      await apiService.post('/auth/register', {
        firebaseId: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.email.split('@')[0],
      });

      return userCredential.user;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async getCurrentUser() {
    return auth.currentUser;
  }

  async getIdToken() {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  }

  _handleError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Email already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many login attempts. Try again later.',
    };

    return new Error(errorMessages[error.code] || error.message);
  }
}

export default new AuthService();

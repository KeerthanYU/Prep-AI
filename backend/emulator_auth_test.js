const axios = require('axios');

(async () => {
  const emuBase = 'http://localhost:9099/identitytoolkit.googleapis.com/v1';
  const email = `emu_user_${Date.now()}@example.com`;
  const password = 'Password123';
  try {
    console.log('Creating emulator user:', email);
    const signUp = await axios.post(`${emuBase}/accounts:signUp?key=anyKey`, {
      email,
      password,
      returnSecureToken: true,
    }, { timeout: 10000 });
    console.log('signUp ok:', signUp.data);

    const signIn = await axios.post(`${emuBase}/accounts:signInWithPassword?key=anyKey`, {
      email,
      password,
      returnSecureToken: true,
    }, { timeout: 10000 });
    console.log('signIn ok:', signIn.data);

    const idToken = signIn.data.idToken;
    console.log('Obtained idToken length:', idToken ? idToken.length : null);

    console.log('Posting idToken to backend /api/auth/firebase');
    const backendRes = await axios.post('http://localhost:5000/api/auth/firebase', {
      firebaseToken: idToken,
      displayName: 'Emu User',
      photoURL: '',
    }, { timeout: 10000 });

    console.log('Backend response status:', backendRes.status);
    console.log('Backend response body:', backendRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
})();

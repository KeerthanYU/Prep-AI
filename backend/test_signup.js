const axios = require('axios');
(async () => {
  try {
    const email = `smoketest_node_${Date.now()}@example.com`;
    const signupUrl = 'http://localhost:5000/api/auth/signup';
    console.log('Signing up:', email);
    const signupRes = await axios.post(signupUrl, { email, password: 'Password123', displayName: 'Node Smoke' });
    console.log('SIGNUP STATUS:', signupRes.status);
    console.log('SIGNUP BODY:', signupRes.data);

    const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password: 'Password123' });
    console.log('LOGIN STATUS:', loginRes.status);
    console.log('LOGIN BODY:', loginRes.data);
  } catch (err) {
    if (err.response) {
      console.error('ERROR STATUS:', err.response.status);
      console.error('ERROR BODY:', JSON.stringify(err.response.data, null, 2));
    } else if (err.request) {
      console.error('NO RESPONSE - request sent:', err.message);
      console.error(err.request);
    } else {
      console.error('REQUEST ERROR:', err.message);
    }
    process.exit(1);
  }
})();

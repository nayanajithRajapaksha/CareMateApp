const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000, // Or whatever port the backend uses
  path: '/api/appointments/availability?clinic_id=41&date=2026-09-16',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test' // Since the endpoint might require auth, wait, does it?
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', error => console.error(error));
req.end();

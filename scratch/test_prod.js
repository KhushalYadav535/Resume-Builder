const https = require('https');

const data = JSON.stringify({
  resumeText: "John Doe. Experienced Software Engineer.",
  fileName: "Resume.pdf"
});

const options = {
  hostname: 'resume-builder-theta-two-82.vercel.app',
  port: 443,
  path: '/api/analyze-resume',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log('Response body:', body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();

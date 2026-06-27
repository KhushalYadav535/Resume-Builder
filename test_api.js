const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/resume/suggestions/comprehensive-analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'sb-jymzchfshbclcydyihzi-auth-token=user_has_to_be_auth_token_here_so_this_is_tricky'
  }
};

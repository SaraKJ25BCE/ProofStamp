const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });
const token = jwt.sign({ userId: 'test_user', passportId: 'test_passport', username: 'test' }, process.env.JWT_SECRET);
console.log(token);

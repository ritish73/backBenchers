require("dotenv").config();

module.exports = {
  DB: process.env.APP_DB,
  PORT: process.env.PORT || 3000,
  SECRET: process.env.APP_SECRET,
  HOST: process.env.YOUR_HOST ||process.env.APP_HOST,
  URL: process.env.APP_URL,
  USER: 'theteambackbenchers@gmail.com',
  PASS: 'BbTesting69',
  PROTOCOL: 'https://',
  HOSTNAME: 'thebackbenchers.co'
};
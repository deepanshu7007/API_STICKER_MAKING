"use strict";
const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

const { PORT, DB_PORT, HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
// assert(PORT, 'PORT is required');
// assert(HOST, 'HOST is required');

module.exports = {
  url: `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${HOST}/${DB_NAME}`, //process.env.MONGODB_CONNECT_URIprocess.env.MONGODB_CONNECT_URI
  // url: `mongodb://${DB_USER}:${DB_PASSWORD}@${HOST}:${DB_PORT}/${DB_NAME}`, //process.env.MONGODB_CONNECT_URIprocess.env.MONGODB_CONNECT_URI
  // url: `mongodb://${HOST}:${DB_PORT}/${DB_NAME}`, //process.env.MONGODB_CONNECT_URIprocess.env.MONGODB_CONNECT_URI
};

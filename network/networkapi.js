// src/services/network.js
const axios = require("axios");
const dotenv = require("dotenv").config();
const logger = require("./logger.js");
const jwt = require("jsonwebtoken");
const helper = require("../helper/helper.js");

// 🔹 Create an axios instance with base defaults
const api = axios.create({
  baseURL: process.env.EOFFICEURL || "https://api.example.com",
  timeout: 30000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Request interceptor (attach tokens, trace IDs, etc.)
api.interceptors.request.use(
  async (config) => {
    // device id update
    const secrectkey = process.env.JWTKEY;
    // Generate JWT token
    const token = jwt.sign(
      { id: process.env.SECRECTIDONESTOP, timestamp: new Date() },
      secrectkey,
      { expiresIn: "1h" }
    );
    const enctoken = await helper.balencrypto(token);
    if (enctoken) config.headers.Authorization = `Bearer ${enctoken}`;

    // logger.info(`→ [${config.method?.toUpperCase()}] ${config.url}`);
    return config;
  },
  (error) => {
    logger.error("Request setup error:", error.message);
    return Promise.reject(error);
  }
);

// 🔹 Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => {
    console.log(`← [${response.status}] ${response.config.url}`);
    return response.data;
  },
  (error) => {
    const status = error.response?.status || "NETWORK_ERROR";
    const msg = error.response?.data || error.message;
    console.log(`✖ [${status}] ${error.config?.url} → ${msg}`);
    return Promise.reject({ status, message: msg });
  }
);

// 🔹 Generic POST request
const postRequest = async (endpoint, data = {}, config = {}) => {
  return api.post(endpoint, data, config);
};
module.exports = { postRequest, api };

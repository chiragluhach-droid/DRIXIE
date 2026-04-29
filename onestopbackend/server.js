const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const app = express();

// Connect to database
connectDB();
// 📦 Body Parser Middleware
const cors = require("cors");


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If you're using cookies or authorization headers
    optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true })); // For form data
const apiroute = require("./router/studentroute");
const adminitroute = require("./router/teacherroute");

app.use("/api/v1", apiroute);
app.use("/api/v1/teacher", adminitroute);
// app.use("/v1/it", adminitroute);

// 🔥 Error Handling Middleware
// 404 Handler (must be after all routes)
app.use((req, res, next) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>404 - Page Not Found</title>
      <style>
        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #ff6a00, #ee0979);
          color: #fff;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          background: rgba(0, 0, 0, 0.5);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          max-width: 500px;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 10px;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 20px;
        }
        a {
          display: inline-block;
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: bold;
          text-decoration: none;
          color: #ee0979;
          background: #fff;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        a:hover {
          background: #ddd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>Sorry, the page you’re looking for doesn’t exist.</p>
        <a href="/">Go Back Home</a>
      </div>
    </body>
    </html>
  `);
});


// 🚀 Start Server Securely
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running on http://127.0.0.1:${port}`);
});

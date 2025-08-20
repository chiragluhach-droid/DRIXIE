const express = require("express");
require("dotenv").config();
// require('./models/associations')
const app = express();
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
// const adminitroute = require("./routes/adminit");

app.use("/api/v1", apiroute);
// app.use("/v1/it", adminitroute);

// 🔥 Error Handling Middleware
app.use((err, res) => {
    // console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
});

// 🚀 Start Server Securely
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running on http://127.0.0.1:${port}`);
});

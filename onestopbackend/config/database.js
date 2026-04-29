const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://chiragchehak_db_user:871NseH12P6siv5x@almamate.acmmgve.mongodb.net/almamate?appName=AlmaMate";
    await mongoose.connect(uri);
    console.log("✅ MongoDB Atlas Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
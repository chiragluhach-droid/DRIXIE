const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const uri = process.env.MONGO_URI || "mongodb+srv://chiragchehak_db_user:871NseH12P6siv5x@almamate.acmmgve.mongodb.net/almamate?appName=AlmaMate";

// Create storage engine
const storage = new GridFsStorage({
  url: uri,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-almamate-${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: "uploads", // collection name for GridFS
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

module.exports = { upload };

const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const otpg = require('otp-generator')
// Allowed file types
// const allowedTypes = ['.pdf', '.doc', '.docx', '.jpeg', '.jpg', '.png']

// // Max size = 5 MB
// const MAX_FILE_SIZE = 7 * 1024 * 1024 // 5MB

// // File filter (safe type only)
// const fileFilter = (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase()
//     if (!allowedTypes.includes(ext)) {
//         return cb(new Error(`Disallowed file type: ${ext}`))
//     }
//     cb(null, true)
// }

// // Safe filename generator using user data
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, './uploads'),

//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname)
//         const baseName = path
//   .basename(file.originalname, ext)                      // Remove extension
//   .replace(/[^a-z0-9\s_-]/gi, '_')                       // Replace unwanted characters with underscore
//   .split(/\s+|_+/)                                       // Split by space or multiple underscores
//   .filter(Boolean)                                       // Remove empty strings
//   .slice(0, 2)                                           // Take only the first 2 words
//   .join('_')                                             // Join with underscore
//   .toLowerCase();                                        // Optional: normalize


//         const fileId = req.user.stdid?.replace(/[^a-z0-9]/gi, '') || 'file'
//         // const university = req.user?.university?.replace(/[^a-z0-9]/gi, '') || 'uni'

//         const digit = otpg.generate(4,{
//             digits:true,
//             lowerCaseAlphabets:false,
//             upperCaseAlphabets:false,
//             specialChars:false
//         })
//         const safeFileName = `${fileId}_${digit}${ext}`
//         cb(null, safeFileName)
//     }
// })
// const storageforsignature = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, '/mnt/filestore/signatures'),
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname)
//         const baseName = path
//   .basename(file.originalname, ext)                      // Remove extension
//   .replace(/[^a-z0-9\s_-]/gi, '_')                       // Replace unwanted characters with underscore
//   .split(/\s+|_+/)                                       // Split by space or multiple underscores
//   .filter(Boolean)                                       // Remove empty strings
//   .slice(0, 2)                                           // Take only the first 2 words
//   .join('_')                                             // Join with underscore
//   .toLowerCase();     
//         const fileId = req.user.name?.replace(/[^a-z0-9]/gi, '') || 'signature'
//         const unique = crypto.randomBytes(4).toString('hex') // random 8-char string
//         const safeFileName = `${baseName}_${fileId}_${req.user.block}_${unique}${ext}`
//         cb(null, safeFileName)
//     }
// })
// const upload = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: MAX_FILE_SIZE
//     }
// })
// const uploadforsignature = multer({
//     storage: storageforsignature,
//     fileFilter,
//     limits: {
//         fileSize: MAX_FILE_SIZE
//     }
// })
// // for profile pictures
// const storageforprofiles = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, '/mnt/filestore/profiles'),
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname)
//         const baseName = path
//   .basename(file.originalname, ext)                      // Remove extension
//   .replace(/[^a-z0-9\s_-]/gi, '_')                       // Replace unwanted characters with underscore
//   .split(/\s+|_+/)                                       // Split by space or multiple underscores
//   .filter(Boolean)                                       // Remove empty strings
//   .slice(0, 2)                                           // Take only the first 2 words
//   .join('_')                                             // Join with underscore
//   .toLowerCase();     
//         const fileId = req.user.name?.replace(/[^a-z0-9]/gi, '') || 'profile'
//         const unique = crypto.randomBytes(4).toString('hex') // random 8-char string
//         const safeFileName = `${baseName}_${fileId}_${university}_${unique}${ext}`
//         cb(null, safeFileName)
//     }
// })
// const uploadforprofilepictures = multer({
//     storageforprofiles,
//     fileFilter,
//     limits: {
//         fileSize: MAX_FILE_SIZE
//     }
// })
// module.exports = { upload, uploadforsignature,uploadforprofilepictures}

const allowedTypes = [".pdf", ".doc", ".docx", ".jpeg", ".jpg", ".png"];
const MAX_FILE_SIZE = 7 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return cb(new Error(`Disallowed file type: ${ext}`));
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

module.exports = { upload, MAX_FILE_SIZE };
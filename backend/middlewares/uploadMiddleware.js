const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Configure storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter for image uploads
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg and .png formats are allowed"), false);
  }
};

// File filter for resume (PDF) uploads
const resumeFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf format is allowed for resume uploads"), false);
  }
};

// Upload instance for images (disk storage)
const upload = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Upload instance for resumes (memory storage, buffer needed by controller)
const uploadResume = multer({
  storage: multer.memoryStorage(),
  fileFilter: resumeFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload, uploadResume };
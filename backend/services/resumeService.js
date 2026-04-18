const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.userId;
    const ext = path.extname(file.originalname);
    const filename = `resume_${userId}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOC/DOCX files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

class ResumeService {
  uploadMiddleware() {
    return upload.single('resume');
  }

  extractTextFromResume(filePath) {
    try {
      // For basic implementation: extract filename and store path
      // In production, use pdfparse or docx libraries for actual text extraction
      const fileName = path.basename(filePath);
      const fileUrl = `/uploads/${fileName}`;

      return {
        fileName,
        fileUrl,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Resume extraction error:', error.message);
      throw new Error('Failed to extract resume content');
    }
  }

  async deleteResume(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Resume deletion error:', error.message);
    }
  }

  validateResumeFile(file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    return true;
  }

  getResumeFilePath(fileName) {
    return path.join(uploadDir, fileName);
  }
}

module.exports = new ResumeService();

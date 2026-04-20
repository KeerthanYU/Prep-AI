const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const resumeParser = require('../utils/resumeParser');
const aiService = require('./unifiedAIService');

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
    const userId = req.userId || 'unknown';
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const filename = `resume_${userId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
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

  /**
   * Extract text from resume file
   */
  async extractTextFromResume(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      return await resumeParser.parseFile(filePath, ext);
    } catch (error) {
      console.error('Resume extraction error:', error.message);
      return '';
    }
  }

  // Legacy methods (internal) for backward compatibility if needed, 
  // now delegated to the central utility.
  async extractFromPDF(filePath) {
    return this.extractTextFromResume(filePath);
  }

  extractFromTextFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error('Text file extraction error:', error.message);
      return '';
    }
  }

  /**
   * Analyze resume and extract skills
   */
  async analyzeResume(resumeText, domain) {
    try {
      if (!resumeText || resumeText.trim().length === 0) {
        return {
          extractedSkills: [],
          relevantSkills: [],
          missingSkills: [],
          overallScore: 0,
        };
      }

      // Use AI service to analyze resume
      const analysis = await aiService.analyzeResume(resumeText, domain);

      return {
        extractedSkills: analysis.extractedSkills || [],
        relevantSkills: analysis.relevantSkills || [],
        missingSkills: analysis.missingSkills || [],
        overallScore: analysis.overallScore || 0,
      };
    } catch (error) {
      console.error('Resume analysis error:', error.message);
      return {
        extractedSkills: [],
        relevantSkills: [],
        missingSkills: [],
        overallScore: 0,
      };
    }
  }

  /**
   * Get resume metadata
   */
  getResumeMetadata(file) {
    return {
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Delete resume file
   */
  async deleteResume(filePath) {
    try {
      if (!filePath) return false;

      // Allow either a full path or just a filename
      let targetPath = filePath;
      if (!path.isAbsolute(filePath) && !filePath.includes(path.sep)) {
        targetPath = path.join(uploadDir, filePath);
      }

      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        console.log('Resume deleted:', targetPath);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Resume deletion error:', error.message);
      return false;
    }
  }

  /**
   * Validate resume file
   */
  validateResumeFile(file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    const allowedExts = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      throw new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed.');
    }

    return true;
  }

  /**
   * Get resume file path
   */
  getResumeFilePath(fileName) {
    return path.join(uploadDir, fileName);
  }

  /**
   * Generate job recommendations based on resume
   */
  async generateJobRecommendations(resumeAnalysis, domain) {
    try {
      const relevanceScore = resumeAnalysis.overallScore || 0;

      if (relevanceScore < 40) {
        return {
          recommendation: 'Consider gaining more experience in the required domain skills',
          suggestions: resumeAnalysis.missingSkills.slice(0, 3),
          difficulty: 'high',
        };
      }

      if (relevanceScore < 70) {
        return {
          recommendation: 'You have a good foundation. Focus on the missing skills to be more competitive',
          suggestions: resumeAnalysis.missingSkills.slice(0, 2),
          difficulty: 'medium',
        };
      }

      return {
        recommendation: 'Your resume is well-aligned with the role. Focus on interview preparation',
        suggestions: ['Practice technical scenarios', 'Prepare behavioral examples'],
        difficulty: 'low',
      };
    } catch (error) {
      console.error('Job recommendation error:', error.message);
      return {
        recommendation: 'Review your resume to improve alignment with the role',
        suggestions: [],
        difficulty: 'medium',
      };
    }
  }
}

module.exports = new ResumeService();

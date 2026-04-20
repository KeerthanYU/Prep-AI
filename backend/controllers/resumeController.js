const fs = require('fs');
const path = require('path');
const resumeParser = require('../utils/resumeParser');
const aiService = require('../services/unifiedAIService');

/**
 * Handle Resume Upload and Skill Extraction
 *
 * Pipeline: Upload → Robust Parse → AI Skill Extraction → Response
 * Designed to handle corrupted PDFs and poor formatting gracefully.
 */
exports.uploadAndExtract = async (req, res, next) => {
    const filePath = req.file?.path || null;

    try {
        console.log('[PIPELINE STEP] 1/4 — Resume upload received');

        // ── Stage 1: Validate file presence ──────────────────────────────────
        if (!req.file) {
            console.warn('[PIPELINE STEP] Abort: No file in request');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const allowedMimeTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        // Strict validation: check extension and mimetype
        if (!allowedMimeTypes.includes(req.file.mimetype) && !['.pdf', '.docx', '.doc'].includes(fileExt)) {
            console.warn('[PIPELINE STEP] Reject: Invalid file type', req.file.mimetype, fileExt);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid file type. Please upload a standard PDF or DOCX file.' 
            });
        }

        console.log('[PIPELINE STEP] File validated:', req.file.originalname);

        // ── Stage 2: Robust Text Extraction ──────────────────────────────────
        console.log('[PIPELINE STEP] 2/4 — Extracting text from', fileExt);
        let extractedText = '';

        try {
            extractedText = await resumeParser.parseFile(filePath, fileExt);
        } catch (parseError) {
            console.error('[PIPELINE ERROR] All parsing strategies failed:', parseError.message);
            return res.status(400).json({
                success: false,
                message: 'This file format is not supported or the file is corrupted. Please upload a standard PDF or DOCX.',
            });
        }

        // Trim and validate length as requested (> 30 chars)
        extractedText = extractedText.trim();
        console.log('[PIPELINE STEP] Extracted text length:', extractedText.length);

        if (!extractedText || extractedText.length < 30) {
            console.warn('[PIPELINE STEP] Extracted text too short or empty');
            return res.status(400).json({
                success: false,
                message: 'No readable content found in the resume. Try different file or ensure it is not just an image.',
            });
        }

        // ── Stage 3: AI Skill Extraction ────────────────────────────────────
        console.log('[PIPELINE STEP] 3/4 — Sending to AI for skill extraction');

        // This NEVER throws — unifiedAIService always returns a safe object
        const analysis = await aiService.extractResumeSkills(extractedText);

        console.log('[PIPELINE STEP] AI analysis result:', {
            skillsCount: analysis?.skills?.length || 0,
            experience_level: analysis?.experience_level,
            domain: analysis?.domain,
        });

        // ── Stage 4: Send response ──────────────────────────────────────────
        console.log('[PIPELINE STEP] 4/4 — Sending success response');

        res.status(200).json({
            success: true,
            data: {
                skills: Array.isArray(analysis?.skills) ? analysis.skills : [],
                experience_level: analysis?.experience_level || 'Mid',
                domain: analysis?.domain || 'Software Engineering',
            },
        });

    } catch (error) {
        console.error('[PIPELINE ERROR] Unexpected error in uploadAndExtract:', error);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while processing your resume. Please try again.',
        });

    } finally {
        // ── Always clean up temp file ────────────────────────────────────────
        if (filePath) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('[PIPELINE STEP] Temporary file cleaned up:', filePath);
                }
            } catch (cleanupErr) {
                console.warn('[PIPELINE STEP] Cleanup warning:', cleanupErr.message);
            }
        }
    }
};
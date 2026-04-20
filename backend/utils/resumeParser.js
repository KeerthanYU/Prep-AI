const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const pdfjs = require('pdfjs-dist');

const path = require('path');
const url = require('url');

// Setup pdfjs-dist worker for Node environment
try {
  const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.mjs');
  // On Windows, absolute paths must be valid file:// URLs for the ESM loader
  pdfjs.GlobalWorkerOptions.workerSrc = url.pathToFileURL(workerPath).href;
  console.log('[PDF PARSER] ✓ pdfjs-dist worker initialized');
} catch (err) {
  console.warn('[PDF PARSER] ⚠ Could not resolve pdf.worker.mjs from pdfjs-dist. Native fallbacks may fail.');
}

/**
 * Robust Resume Parser Utility
 * Implements a multi-stage fallback chain for PDFs and handles DOCX.
 */
class ResumeParser {
  
  /**
   * Main entry point: Parse file based on extension/mimetype
   */
  async parseFile(filePath, fileExt) {
    try {
      const buffer = fs.readFileSync(filePath);
      
      if (fileExt === '.pdf') {
          return await this.parsePDF(buffer);
      } else if (fileExt === '.docx' || fileExt === '.doc') {
          return await this.parseDOCX(buffer);
      } else if (fileExt === '.txt') {
          return buffer.toString('utf8');
      }
      
      throw new Error(`Unsupported file extension: ${fileExt}`);
    } catch (err) {
      console.error(`[PARSER ERROR] Failed to read/parse file: ${filePath}`, err.message);
      throw err;
    }
  }

  /**
   * Robust PDF Parsing with Fallbacks
   */
  async parsePDF(buffer) {
    console.log('[PDF PARSER] Attempting 1/3: pdf-parse');
    try {
      const data = await pdfParse(buffer);
      if (data.text && data.text.trim().length > 50) {
        return data.text;
      }
      console.warn('[PDF PARSER] pdf-parse returned suspiciously low text content.');
    } catch (err) {
      console.warn('[PDF PARSER] ⚠ pdf-parse failed:', err.message);
    }

    console.log('[PDF PARSER] Attempting 2/3: pdfjs-dist (High Robustness)');
    try {
      const text = await this.parseWithPdfJs(buffer);
      if (text && text.trim().length > 30) {
        return text;
      }
    } catch (err) {
      console.warn('[PDF PARSER] ⚠ pdfjs-dist failed:', err.message);
    }

    console.log('[PDF PARSER] Attempting 3/3: Last resort raw buffer scan');
    try {
      // Very basic fallback: Extract anything that looks like readable ASCII/UTF8
      const rawText = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      const cleaned = rawText.replace(/\s+/g, ' ').trim();
      if (cleaned.length > 50) {
        return cleaned;
      }
    } catch (err) {
      console.warn('[PDF PARSER] ⚠ Raw buffer fallback failed:', err.message);
    }

    throw new Error('All PDF parsing strategies failed to extract readable text.');
  }

  /**
   * Internal helper for pdfjs-dist parsing
   */
  async parseWithPdfJs(buffer) {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
  }

  /**
   * DOCX Parsing with Mammoth
   */
  async parseDOCX(buffer) {
    console.log('[DOCX PARSER] Extracting text with mammoth');
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.messages.length > 0) {
        console.warn('[DOCX PARSER] Mammoth messages:', result.messages);
      }
      return result.value || '';
    } catch (err) {
      console.error('[DOCX PARSER] ❌ Mammoth failed:', err.message);
      throw new Error('Could not parse DOCX file. It may be corrupted.');
    }
  }
}

module.exports = new ResumeParser();

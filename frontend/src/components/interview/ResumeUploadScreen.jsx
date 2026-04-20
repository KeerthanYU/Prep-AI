import React, { useState, useContext, useCallback } from 'react';
import apiService from '../../services/apiService';
import { InterviewContext } from '../../context/InterviewContext';

const ResumeUploadScreen = () => {
  const { nextStep, setResumeData, setLoading, setError } = useContext(InterviewContext);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragging(true);
    } else if (e.type === 'dragleave') {
      setDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Uses apiService which auto-attaches JWT from interceptor
      const response = await apiService.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        setResumeData(response.data.data);
        nextStep(); // Move to Interview screen
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to process resume');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 animate-fadeIn w-full max-w-xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Upload Resume</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        We'll use Gemini to extract your skills and generate tailored questions.
      </p>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
          dragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400'
        }`}
      >
        <span className="text-5xl mb-4">📄</span>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          {file ? file.name : 'Drag & drop resume here'}
        </p>
        <p className="text-xs text-gray-500 mt-2">Supports PDF, DOCX (Max 5MB)</p>
        <input
          type="file"
          id="resumeInput"
          className="hidden"
          accept=".pdf,.docx,.doc"
          onChange={handleFileChange}
        />
        <button
          onClick={() => document.getElementById('resumeInput').click()}
          className="mt-6 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          Or browse files
        </button>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full mt-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform ${
          !file || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Analyzing with AI...
          </div>
        ) : (
          'Analyze & Continue'
        )}
      </button>
    </div>
  );
};

export default ResumeUploadScreen;

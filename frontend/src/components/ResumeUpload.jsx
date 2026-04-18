import React, { useState, useRef } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import resumeService from '../services/resumeService';

const ResumeUpload = ({ onUploadSuccess, existingResume, onDelete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setUploading(true);

      // Validate file
      resumeService.validateFile(file);

      // Upload resume
      const result = await resumeService.uploadResume(file);
      onUploadSuccess?.(result.resume);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await resumeService.deleteResume();
      onDelete?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <label className="label">Upload Resume (PDF / DOC / DOCX)</label>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {existingResume && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {existingResume.fileName}
            </p>
            <p className="text-xs text-gray-500">
              Uploaded: {new Date(existingResume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded"
            title="Delete resume"
          >
            <FiX size={20} />
          </button>
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <FiUpload className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-sm font-medium text-gray-700">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {uploading && (
        <p className="text-sm text-blue-600 text-center">Uploading...</p>
      )}
    </div>
  );
};

export default ResumeUpload;

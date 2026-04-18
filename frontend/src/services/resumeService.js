import apiService from './apiService';

class ResumeService {
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await apiService.post('/users/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.error || 'Failed to upload resume');
    }
  }

  async deleteResume() {
    try {
      const response = await apiService.delete('/users/resume');
      return response.data;
    } catch (error) {
      throw new Error(error.error || 'Failed to delete resume');
    }
  }

  validateFile(file) {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Only PDF and DOC/DOCX files are allowed');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    return true;
  }

  getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
  }
}

export default new ResumeService();

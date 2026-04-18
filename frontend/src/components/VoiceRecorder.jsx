import React, { useState, useRef, useEffect } from 'react';
import { FiMic, FiMicOff, FiSquare } from 'react-icons/fi';
import voiceService from '../services/voiceService';

const VoiceRecorder = ({ onTranscriptChange, onRecordingChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [interimText, setInterimText] = useState('');

  const handleStart = () => {
    setError(null);
    setTranscript('');
    setInterimText('');

    voiceService.startListening(
      (result) => {
        setInterimText(result);
        onTranscriptChange?.(result);
      },
      (err) => {
        setError(err);
        setIsRecording(false);
        onRecordingChange?.(false);
      }
    );

    setIsRecording(true);
    onRecordingChange?.(true);
  };

  const handleStop = () => {
    const finalTranscript = voiceService.stopListening();
    setTranscript(finalTranscript);
    setInterimText('');
    setIsRecording(false);
    onTranscriptChange?.(finalTranscript);
    onRecordingChange?.(false);
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        voiceService.stopListening();
      }
    };
  }, [isRecording]);

  if (!voiceService.isSpeechRecognitionSupported()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        Speech Recognition is not supported in your browser
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={handleStart}
            className="btn-primary flex items-center gap-2"
          >
            <FiMic size={20} />
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="btn-danger flex items-center gap-2"
          >
            <FiSquare size={20} />
            Stop Recording
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {(transcript || interimText) && (
        <div className="space-y-2">
          <label className="label">Your Transcript</label>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-24">
            <p className="text-gray-900">{transcript || interimText}</p>
            {interimText && !transcript && (
              <p className="text-gray-400 italic mt-2">(still listening...)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;

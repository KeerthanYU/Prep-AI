class VoiceService {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.synthesis = SpeechSynthesis;
    this.isListening = false;
    this.transcript = '';
    this.isSpeaking = false;

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }

  startListening(onResult, onError) {
    if (!this.recognition) {
      onError('Speech Recognition not supported in this browser');
      return;
    }

    this.transcript = '';

    this.recognition.onresult = (event) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.transcript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      onResult(this.transcript + interim);
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    return this.transcript.trim();
  }

  speak(text, onStart, onEnd, onError) {
    if (!this.synthesis) {
      onError('Speech Synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.isSpeaking = true;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      onError?.(event.error);
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  isSupported() {
    return !!(this.recognition && this.synthesis);
  }

  isSpeechRecognitionSupported() {
    return !!this.recognition;
  }

  isSpeechSynthesisSupported() {
    return !!this.synthesis;
  }
}

export default new VoiceService();

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check support for both Synthesis and Recognition
    const hasSynthesis = 'speechSynthesis' in window;
    const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    if (!hasSynthesis || !hasRecognition) {
      setSupported(false);
    }
  }, []);

  const listen = useCallback((onResult, lang = 'hi-IN') => {
    if (!supported) {
      toast.error('Voice dictation is not supported on this browser.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang; // 'hi-IN' for Hindi, 'en-IN' for English

      recognition.onstart = () => {
        setIsListening(true);
        toast('🎙️ Listening...', { icon: '👂', duration: 3000 });
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'aborted') {
          toast.error(`Mic error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      return () => {
        recognition.stop();
        setIsListening(false);
      };
    } catch (err) {
      console.error(err);
      toast.error('Could not start microphone.');
      setIsListening(false);
    }
  }, [supported]);

  const speak = useCallback((text, lang = 'hi-IN') => {
    if (!supported) {
      toast.error('Text-to-speech is not supported on this browser.');
      return;
    }
    
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (isSpeaking) {
          setIsSpeaking(false);
          return; // Acts as a toggle off if already speaking
        }
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for better clarity in rural contexts
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
      toast.error('Could not play audio.');
      setIsSpeaking(false);
    }
  }, [supported, isSpeaking]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { listen, speak, stopSpeaking, isListening, isSpeaking, supported };
}

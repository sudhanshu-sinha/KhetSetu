import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function VoiceSearch({ onResult, placeholder }) {
  const { t, i18n } = useTranslation();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(final || interim);
      if (final) {
        onResult?.(final);
        setListening(false);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => { try { recognition.stop(); } catch {} };
  }, [i18n.language]);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        className={`relative p-3 rounded-2xl transition-all duration-300 ${
          listening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-primary-300'
        }`}
      >
        {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
        {listening && (
          <>
            <motion.span
              className="absolute inset-0 rounded-2xl border-2 border-red-400"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.span
              className="absolute inset-0 rounded-2xl border-2 border-red-300"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
      </motion.button>

      {/* Transcript overlay */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-64 card-glass p-3 z-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-500">
                {i18n.language === 'hi' ? 'सुन रहा है...' : 'Listening...'}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 min-h-[20px]">
              {transcript || (i18n.language === 'hi' ? '"पटना में कटाई का काम"' : '"harvesting work near Patna"')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

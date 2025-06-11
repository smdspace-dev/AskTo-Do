import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Simple SVG icon components
const Mic = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
  </svg>
);

const MicOff = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18.707 3.293a1 1 0 010 1.414L5.414 18l-1.414-1.414L17.293 3.293a1 1 0 011.414 0zM7 4a3 3 0 016 0v1.586l-6 6V4zm0 8.414L13.586 6H13v2a3 3 0 01-6 0v2.414z" clipRule="evenodd" />
  </svg>
);

const X = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Type = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

const Volume2 = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9v6l4 2V7L9 9z" />
  </svg>
);

const VoiceModal = ({ 
  isListening, 
  isAISpeaking,
  isProcessing,
  onClose, 
  onTextInput, 
  conversationHistory, 
  transcript,
  error,
  lastResponse
}) => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');

  // Auto-close modal when not listening and not speaking
  useEffect(() => {
    if (!isListening && !isAISpeaking && transcript && !isProcessing) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isListening, isAISpeaking, transcript, onClose, isProcessing]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textValue.trim()) {
      onTextInput(textValue.trim());
      setTextValue('');
      setShowTextInput(false);
      onClose();
    }
  };

  const formatTimestamp = (timestamp) => {
    return format(timestamp, 'HH:mm');
  };

  const getVoiceStatus = () => {
    if (isAISpeaking) return { text: 'AI Speaking...', class: 'speaking' };
    if (isProcessing) return { text: 'Processing...', class: 'processing' };
    if (isListening) return { text: 'Listening...', class: 'listening' };
    return { text: 'Ready', class: 'ready' };
  };

  const renderWaveform = () => {
    if (!isListening && !isAISpeaking) return null;
    
    return (
      <div className="waveform-container">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="waveform-bar" />
        ))}
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (!isProcessing) return null;
    
    return (
      <div className="typing-indicator">
        <span className="text-sm text-gray-400">AI is thinking</span>
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="typing-dot" />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="modal-futuristic w-full max-w-3xl max-h-[85vh] overflow-hidden relative">
        {/* Neural Network Background */}
        <div className="neural-network-bg"></div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {isListening ? (
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-6 bg-white rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">AI Voice Assistant</h2>
                <p className="text-blue-100 text-sm">
                  {isListening ? 'Listening...' : 'Ready to help'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showTextInput ? (
            <div className="space-y-6">
              {/* Voice Status */}
              <div className="text-center">
                <div className={`
                  inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 transition-all duration-300
                  ${isListening 
                    ? 'bg-red-100 border-4 border-red-300 animate-pulse' 
                    : 'bg-blue-100 border-4 border-blue-300'
                  }
                `}>
                  <svg className={`w-12 h-12 ${isListening ? 'text-red-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isListening ? 'Listening for your voice...' : 'Ready to listen'}
                </h3>
                
                {transcript && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 font-medium">You said:</p>
                    <p className="text-blue-700">"{transcript}"</p>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800">Error: {error}</p>
                  </div>
                )}
                
                <p className="text-gray-600 mb-6">
                  {isListening 
                    ? 'Speak clearly and naturally...'
                    : 'Click the microphone to start speaking'
                  }
                </p>
              </div>

              {/* Recent Conversation */}
              {getLastFewMessages().length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent conversation:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getLastFewMessages().map((message) => (
                      <div
                        key={message.id}
                        className={`
                          text-sm p-2 rounded-lg
                          ${message.speaker === 'assistant' 
                            ? 'bg-blue-50 text-blue-800' 
                            : 'bg-gray-50 text-gray-800'
                          }
                        `}
                      >
                        <span className="font-medium">
                          {message.speaker === 'assistant' ? '🤖 Assistant' : '👤 You'}:
                        </span>
                        <span className="ml-2">{message.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Try saying:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                  <div>💬 "Create a task to buy groceries tomorrow"</div>
                  <div>💬 "Schedule a meeting for Friday, high priority"</div>
                  <div>💬 "Add multiple tasks: call dentist and pay bills"</div>
                  <div>💬 "Remind me to submit the report by end of week"</div>
                </div>
              </div>

              {/* Switch to text input */}
              <div className="text-center">
                <button
                  onClick={() => setShowTextInput(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                >
                  Type instead of speaking
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Type your message</h3>
              <form onSubmit={handleTextSubmit} className="space-y-4">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="What would you like to do? (e.g., 'Create a task to call John tomorrow')"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  autoFocus
                />
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={!textValue.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTextInput(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back to Voice
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;
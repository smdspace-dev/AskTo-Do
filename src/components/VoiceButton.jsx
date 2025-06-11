import React, { useState } from 'react';

const VoiceButton = ({ 
  isListening, 
  onStartListening, 
  onStopListening, 
  onTextInput, 
  error 
}) => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');

  const handleVoiceButtonClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textValue.trim()) {
      onTextInput(textValue.trim());
      setTextValue('');
      setShowTextInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {!showTextInput ? (
        <div className="text-center space-y-4">
          {/* Voice Button */}
          <button
            onClick={handleVoiceButtonClick}
            disabled={!!error}
            className={`
              voice-button relative
              ${isListening ? 'listening' : ''}
              ${error ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white rounded-full"></div>
                <span>Stop Listening</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-6 h-6" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>Hold to Speak</span>
              </div>
            )}
            
            {/* Pulse animation for listening state */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
            )}
          </button>

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium">Try saying:</p>
            <ul className="text-left space-y-1">
              <li>• "Create a task"</li>
              <li>• "Buy groceries tomorrow"</li>
              <li>• "Schedule meeting for Friday, high priority"</li>
              <li>• "Add multiple tasks"</li>
            </ul>
          </div>

          {/* Alternative input option */}
          <button
            onClick={() => setShowTextInput(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
          >
            Type instead of speaking
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Text Input Form */}
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label htmlFor="task-input" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to do?
              </label>
              <textarea
                id="task-input"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your task or request here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!textValue.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTextInput(false);
                  setTextValue('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Switch back to voice */}
          <button
            onClick={() => setShowTextInput(false)}
            className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium underline"
          >
            Switch back to voice input
          </button>
        </div>
      )}

      {/* Status Messages */}
      {isListening && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Listening for your voice...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
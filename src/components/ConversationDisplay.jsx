import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';

const ConversationDisplay = ({ messages, isListening }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    return format(timestamp, 'HH:mm');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Conversation</h3>
          {isListening && (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="waveform-bar w-1 h-4 rounded-full"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="text-sm text-red-600 font-medium">Listening...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="px-6 py-4 h-96 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🎙️</div>
              <p>Start a conversation by pressing the voice button below!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`conversation-message ${message.speaker}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {message.speaker === 'assistant' ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">🤖</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">👤</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {message.speaker === 'assistant' ? 'Assistant' : 'You'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                    
                    <div className="mt-1">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator when listening */}
          {isListening && (
            <div className="conversation-message assistant">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🤖</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2">
                    <p className="text-sm font-medium text-gray-900">Assistant</p>
                    <p className="text-xs text-gray-500">now</p>
                  </div>
                  
                  <div className="mt-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ConversationDisplay;
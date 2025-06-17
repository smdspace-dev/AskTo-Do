import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';

const ConversationPanel = ({ messages, isListening }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    return format(timestamp, 'HH:mm');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Voice Assistant</h3>
            <p className="text-xs text-gray-500">
              {isListening ? '🎤 Listening...' : 'Ready to help'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Start a conversation</h4>
            <p className="text-sm text-gray-500 mb-4">
              Use the voice button to create tasks with natural language
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <p>💡 Try saying:</p>
              <p>"Buy groceries tomorrow"</p>
              <p>"Meeting with John at 3pm"</p>
              <p>"Finish project report by Friday"</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs lg:max-w-md px-4 py-3 rounded-2xl
                    ${message.speaker === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs opacity-75">
                      {message.speaker === 'assistant' ? '🤖' : '👤'}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator when listening */}
            {isListening && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs opacity-75">🤖</span>
                    <span className="text-xs opacity-75">now</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            {messages.length > 0 
              ? 'Use the voice button to continue the conversation'
              : 'Click the voice button to get started'
            }
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>🎤 Voice commands</span>
            <span>⌨️ Quick add</span>
            <span>🔍 Search tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPanel;
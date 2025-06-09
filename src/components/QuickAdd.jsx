import React, { useState, useRef } from 'react';

const QuickAdd = ({ onAddTask, onVoiceStart, searchQuery, onSearchChange }) => {
  const [quickTaskText, setQuickTaskText] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const inputRef = useRef(null);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (quickTaskText.trim()) {
      onAddTask(quickTaskText.trim());
      setQuickTaskText('');
      setShowQuickAdd(false);
    }
  };

  const handleQuickAddToggle = () => {
    setShowQuickAdd(!showQuickAdd);
    setTimeout(() => {
      if (!showQuickAdd && inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Quick Add Toggle */}
        <button
          onClick={handleQuickAddToggle}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${showQuickAdd 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Quick Add</span>
        </button>

        {/* Voice Button */}
        <button
          onClick={onVoiceStart}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          <span>Voice</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {showQuickAdd && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <form onSubmit={handleQuickSubmit} className="space-y-3">
            <div>
              <input
                ref={inputRef}
                type="text"
                placeholder="What do you need to do? (e.g., 'Buy groceries tomorrow, high priority')"
                value={quickTaskText}
                onChange={(e) => setQuickTaskText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                💡 Try: "Meeting with John tomorrow at 2pm, high priority"
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickTaskText.trim()}
                  className="px-4 py-1 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuickAdd;
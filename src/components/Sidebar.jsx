import React from 'react';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const Sidebar = ({ 
  currentView, 
  onViewChange, 
  tasks, 
  selectedCategory, 
  onCategoryChange,
  onVoiceStart 
}) => {
  
  // Calculate task counts for each view
  const getTaskCounts = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    return {
      all: tasks.filter(t => t.status === 'pending').length,
      today: tasks.filter(t => t.status === 'pending' && t.dueDate && isToday(new Date(t.dueDate))).length,
      tomorrow: tasks.filter(t => t.status === 'pending' && t.dueDate && isTomorrow(new Date(t.dueDate))).length,
      week: tasks.filter(t => t.status === 'pending' && t.dueDate && isWithinInterval(new Date(t.dueDate), { start: weekStart, end: weekEnd })).length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
  };

  const counts = getTaskCounts();

  // Get category counts
  const getCategoryCounts = () => {
    const categories = {};
    tasks.filter(t => t.status === 'pending').forEach(task => {
      if (task.category) {
        categories[task.category] = (categories[task.category] || 0) + 1;
      }
    });
    return categories;
  };

  const categoryCounts = getCategoryCounts();

  const views = [
    { id: 'all', name: 'All Tasks', icon: '📋', count: counts.all },
    { id: 'today', name: 'Today', icon: '📅', count: counts.today },
    { id: 'tomorrow', name: 'Tomorrow', icon: '📆', count: counts.tomorrow },
    { id: 'week', name: 'This Week', icon: '🗓️', count: counts.week },
    { id: 'completed', name: 'Completed', icon: '✅', count: counts.completed }
  ];

  const categories = [
    { id: 'work', name: 'Work', icon: '💼', color: 'bg-blue-500' },
    { id: 'personal', name: 'Personal', icon: '👤', color: 'bg-green-500' },
    { id: 'shopping', name: 'Shopping', icon: '🛒', color: 'bg-yellow-500' },
    { id: 'health', name: 'Health', icon: '🏥', color: 'bg-red-500' },
    { id: 'home', name: 'Home', icon: '🏠', color: 'bg-purple-500' },
    { id: 'finance', name: 'Finance', icon: '💰', color: 'bg-indigo-500' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Task Assistant</h1>
            <p className="text-xs text-gray-500">AI-Powered Tasks</p>
          </div>
        </div>
      </div>

      {/* Voice Quick Action */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onVoiceStart}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Add with Voice</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Views */}
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
            Views
          </div>
          <nav className="space-y-1">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                  ${currentView === view.id 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{view.icon}</span>
                  <span className="font-medium">{view.name}</span>
                </div>
                {view.count > 0 && (
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${currentView === view.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {view.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Categories */}
        <div className="p-2 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
            Categories
          </div>
          <nav className="space-y-1">
            {categories.map((category) => {
              const count = categoryCounts[category.id] || 0;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                    ${selectedCategory === category.id 
                      ? 'bg-gray-50 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {tasks.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-xs text-gray-500">
            Tasks Completed
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400 text-center">
          {tasks.filter(t => t.createdBy === 'voice').length} created by voice
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
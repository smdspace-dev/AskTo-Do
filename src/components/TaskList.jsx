import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';

const TaskList = ({ tasks, onTaskAction, currentView, emptyState }) => {
  const [hoveredTask, setHoveredTask] = useState(null);

  const formatDueDate = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);
    
    if (isToday(dateObj)) return 'Today';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    if (isPast(dateObj)) return `${format(dateObj, 'MMM do')} (Overdue)`;
    if (isThisWeek(dateObj)) return format(dateObj, 'EEEE');
    
    return format(dateObj, 'MMM do');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-400 bg-red-50';
      case 'medium':
        return 'border-yellow-400 bg-yellow-50';
      case 'low':
        return 'border-green-400 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'personal':
        return 'bg-green-100 text-green-800';
      case 'shopping':
        return 'bg-yellow-100 text-yellow-800';
      case 'health':
        return 'bg-red-100 text-red-800';
      case 'home':
        return 'bg-purple-100 text-purple-800';
      case 'finance':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'shopping': return '🛒';
      case 'health': return '🏥';
      case 'home': return '🏠';
      case 'finance': return '💰';
      default: return '📁';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{emptyState.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyState.title}
          </h3>
          <p className="text-gray-500 mb-6">
            {emptyState.subtitle}
          </p>
          {currentView !== 'completed' && (
            <div className="space-y-2 text-sm text-gray-400">
              <p>💡 Try using voice commands:</p>
              <p>"Buy groceries tomorrow"</p>
              <p>"Schedule meeting for Friday, high priority"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onMouseEnter={() => setHoveredTask(task.id)}
            onMouseLeave={() => setHoveredTask(null)}
            className={`
              group relative border-l-4 rounded-lg p-4 transition-all duration-200 cursor-pointer
              ${task.status === 'completed' 
                ? 'bg-gray-50 border-gray-300 opacity-75' 
                : getPriorityColor(task.priority)
              }
              hover:shadow-md hover:scale-[1.02]
            `}
          >
            <div className="flex items-start space-x-3">
              {/* Checkbox */}
              <button
                onClick={() => onTaskAction(task.id, 'complete')}
                className={`
                  flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-all duration-200
                  ${task.status === 'completed' 
                    ? 'bg-green-500 border-green-500 shadow-md' 
                    : 'border-gray-300 hover:border-green-400 hover:scale-110'
                  }
                `}
              >
                {task.status === 'completed' && (
                  <svg className="w-3 h-3 text-white m-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`
                      font-medium text-gray-900 mb-1
                      ${task.status === 'completed' ? 'line-through text-gray-500' : ''}
                    `}>
                      {task.title}
                    </h3>
                    
                    {/* Task Metadata */}
                    <div className="flex items-center space-x-3 text-sm">
                      {/* Priority */}
                      <div className="flex items-center space-x-1">
                        <span>{getPriorityIcon(task.priority)}</span>
                        <span className="text-gray-600 capitalize">{task.priority}</span>
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className={`
                          flex items-center space-x-1
                          ${isPast(new Date(task.dueDate)) && task.status === 'pending' 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-600'
                          }
                        `}>
                          <span>📅</span>
                          <span>{formatDueDate(task.dueDate)}</span>
                        </div>
                      )}

                      {/* Category */}
                      {task.category && (
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${getCategoryColor(task.category)}
                        `}>
                          <span className="mr-1">{getCategoryIcon(task.category)}</span>
                          {task.category}
                        </span>
                      )}

                      {/* Voice Created Indicator */}
                      {task.createdBy === 'voice' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🎤 Voice
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`
                    flex items-center space-x-2 ml-4 transition-opacity duration-200
                    ${hoveredTask === task.id ? 'opacity-100' : 'opacity-0'}
                  `}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add edit functionality
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskAction(task.id, 'delete');
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle animation line for completed tasks */}
            {task.status === 'completed' && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-transparent rounded-lg pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
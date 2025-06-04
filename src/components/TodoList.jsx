import React, { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const TodoList = ({ tasks, onTaskAction }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply filters
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(task => task.status === 'pending');
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
      case 'overdue':
        filtered = filtered.filter(task => 
          task.status === 'pending' && task.dueDate && isPast(new Date(task.dueDate))
        );
        break;
      case 'today':
        filtered = filtered.filter(task => 
          task.dueDate && isToday(new Date(task.dueDate))
        );
        break;
      case 'tomorrow':
        filtered = filtered.filter(task => 
          task.dueDate && isTomorrow(new Date(task.dueDate))
        );
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [tasks, filter, sortBy]);

  const taskCounts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const overdue = tasks.filter(t => 
      t.status === 'pending' && t.dueDate && isPast(new Date(t.dueDate))
    ).length;

    return { total, completed, pending, overdue };
  }, [tasks]);

  const formatDate = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);
    
    if (isToday(dateObj)) return 'Today';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    if (isPast(dateObj)) return `${format(dateObj, 'MMM do')} (Overdue)`;
    
    return format(dateObj, 'MMM do');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Your Tasks</h3>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">No tasks yet</h4>
          <p className="text-gray-500">
            Use the voice assistant above to create your first task!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header with Stats */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Tasks</h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              {taskCounts.pending} pending
            </span>
            <span className="text-green-600">
              {taskCounts.completed} completed
            </span>
            {taskCounts.overdue > 0 && (
              <span className="text-red-600 font-medium">
                {taskCounts.overdue} overdue
              </span>
            )}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="tomorrow">Due Tomorrow</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredAndSortedTasks.map((task) => (
          <div
            key={task.id}
            className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Checkbox */}
              <button
                onClick={() => onTaskAction(task.id, 'complete')}
                className={`
                  flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 transition-colors
                  ${task.status === 'completed' 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-400'
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
                    <h4 className={`text-sm font-medium ${
                      task.status === 'completed' 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h4>
                    
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      {/* Priority */}
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                        ${getPriorityColor(task.priority)}
                      `}>
                        {getPriorityEmoji(task.priority)} {task.priority}
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <span className={`
                          ${isPast(new Date(task.dueDate)) && task.status === 'pending' 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-500'
                          }
                        `}>
                          📅 {formatDate(task.dueDate)}
                        </span>
                      )}

                      {/* Category */}
                      {task.category && (
                        <span className="text-gray-500">
                          📂 {task.category}
                        </span>
                      )}

                      {/* Created by voice indicator */}
                      {task.createdBy === 'voice' && (
                        <span className="text-blue-500">
                          🎤 Voice
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onTaskAction(task.id, 'delete')}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 002 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v1H4V5zM3 8a1 1 0 011-1h12a1 1 0 110 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V9a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedTasks.length === 0 && tasks.length > 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>No tasks match the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
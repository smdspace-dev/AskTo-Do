import React, { useMemo } from 'react';
import { isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval, isPast, format } from 'date-fns';
import TaskList from './TaskList';
import TaskPreview from './TaskPreview';
import ConversationPanel from './ConversationPanel';

const MainContent = ({ 
  currentView, 
  tasks, 
  onTaskAction, 
  searchQuery, 
  selectedCategory,
  currentTask,
  multipleTasks,
  showTaskPreview,
  onTaskEdit,
  onTaskConfirm,
  onTaskCancel,
  conversationHistory,
  isListening
}) => {
  
  // Filter tasks based on current view, search, and category
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    
    // Filter by view
    switch (currentView) {
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
      case 'week':
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        filtered = filtered.filter(task => 
          task.dueDate && isWithinInterval(new Date(task.dueDate), { start: weekStart, end: weekEnd })
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
      case 'all':
      default:
        filtered = filtered.filter(task => task.status === 'pending');
        break;
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.category && task.category.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [tasks, currentView, searchQuery, selectedCategory]);

  // Get view title and subtitle
  const getViewInfo = () => {
    const pendingCount = filteredTasks.filter(t => t.status === 'pending').length;
    const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
    
    switch (currentView) {
      case 'today':
        return {
          title: 'Today',
          subtitle: `${pendingCount} tasks due today`,
          icon: '📅',
          description: format(new Date(), 'EEEE, MMMM do, yyyy')
        };
      case 'tomorrow':
        return {
          title: 'Tomorrow', 
          subtitle: `${pendingCount} tasks due tomorrow`,
          icon: '📆',
          description: format(new Date(Date.now() + 86400000), 'EEEE, MMMM do, yyyy')
        };
      case 'week':
        return {
          title: 'This Week',
          subtitle: `${pendingCount} tasks this week`,
          icon: '🗓️',
          description: 'Tasks scheduled for this week'
        };
      case 'completed':
        return {
          title: 'Completed Tasks',
          subtitle: `${completedCount} completed tasks`,
          icon: '✅',
          description: 'Well done! Keep up the great work'
        };
      case 'all':
      default:
        return {
          title: 'All Tasks',
          subtitle: `${pendingCount} pending tasks`,
          icon: '📋',
          description: 'Your complete task overview'
        };
    }
  };

  const viewInfo = getViewInfo();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Task Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{viewInfo.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{viewInfo.title}</h1>
                  <p className="text-sm text-gray-500">{viewInfo.description}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{viewInfo.subtitle}</div>
              {searchQuery && (
                <div className="text-xs text-blue-600 mt-1">
                  Filtering by: "{searchQuery}"
                </div>
              )}
              {selectedCategory && (
                <div className="text-xs text-purple-600 mt-1">
                  Category: {selectedCategory}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto">
          <TaskList 
            tasks={filteredTasks}
            onTaskAction={onTaskAction}
            currentView={currentView}
            emptyState={{
              icon: viewInfo.icon,
              title: `No ${currentView === 'completed' ? 'completed' : 'pending'} tasks`,
              subtitle: searchQuery 
                ? `No tasks match "${searchQuery}"`
                : selectedCategory
                ? `No tasks in ${selectedCategory} category`
                : currentView === 'today'
                ? "You're all caught up for today!"
                : currentView === 'completed'
                ? "Complete some tasks to see them here"
                : "Add some tasks to get started"
            }}
          />
        </div>
      </div>

      {/* Right Panel - Task Preview or Conversation */}
      <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
        {showTaskPreview && (currentTask || multipleTasks.length > 0) ? (
          <TaskPreview
            task={currentTask}
            multipleTasks={multipleTasks}
            onEdit={onTaskEdit}
            onConfirm={onTaskConfirm}
            onCancel={onTaskCancel}
          />
        ) : (
          <ConversationPanel 
            messages={conversationHistory}
            isListening={isListening}
          />
        )}
      </div>
    </div>
  );
};

export default MainContent;
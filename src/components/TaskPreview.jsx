import React, { useState } from 'react';
import { format } from 'date-fns';

const TaskPreview = ({ task, multipleTasks, onEdit, onConfirm, onCancel }) => {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const isMultiple = multipleTasks && multipleTasks.length > 0;
  const tasksToShow = isMultiple ? multipleTasks : [task].filter(Boolean);

  const handleEditStart = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleEditSave = (field) => {
    if (onEdit) {
      if (field === 'dueDate') {
        // Convert string to date if needed
        const date = editValue ? new Date(editValue) : null;
        onEdit(field, date);
      } else {
        onEdit(field, editValue);
      }
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
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
        return '🟡';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return format(new Date(date), 'EEEE, MMMM do');
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  };

  const renderEditableField = (label, field, value, taskIndex = 0) => {
    const isEditing = editingField === `${field}-${taskIndex}`;
    const fieldKey = `${field}-${taskIndex}`;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">
            {label}:
          </span>
          <div className="flex-1 flex items-center space-x-2">
            {field === 'dueDate' ? (
              <input
                type="date"
                value={formatDateForInput(editValue)}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                autoFocus
              />
            ) : field === 'priority' ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                autoFocus
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                autoFocus
              />
            )}
            <button
              onClick={() => handleEditSave(field)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              ✓
            </button>
            <button
              onClick={handleEditCancel}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-sm font-medium text-gray-600">
            {label}:
          </span>
          <span className="text-sm text-gray-800">
            {field === 'priority' && getPriorityEmoji(value)} 
            {field === 'dueDate' ? formatDate(value) : (value || 'Not set')}
          </span>
        </div>
        {!isMultiple && (
          <button
            onClick={() => handleEditStart(fieldKey, value)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
          >
            Edit
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isMultiple ? `Task Preview (${tasksToShow.length} tasks)` : 'Task Preview'}
        </h3>
      </div>

      {/* Task(s) Content */}
      <div className="px-6 py-4 space-y-6">
        {tasksToShow.map((currentTask, index) => (
          <div 
            key={currentTask?.id || index}
            className={`
              task-preview-card
              ${index > 0 ? 'border-t border-gray-100 pt-6' : ''}
            `}
          >
            {isMultiple && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-600">Task {index + 1}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Title */}
              {renderEditableField('📋 Task', 'title', currentTask?.title, index)}

              {/* Due Date */}
              {renderEditableField('📅 Due Date', 'dueDate', currentTask?.dueDate, index)}

              {/* Priority */}
              {renderEditableField('⚡ Priority', 'priority', currentTask?.priority, index)}

              {/* Category */}
              {currentTask?.category && renderEditableField('📂 Category', 'category', currentTask.category, index)}

              {/* Description */}
              {currentTask?.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {currentTask.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium transition-colors"
          >
            ✓ Confirm {isMultiple ? `${tasksToShow.length} Tasks` : 'Task'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 font-medium transition-colors"
          >
            ✕ Cancel
          </button>
        </div>
        
        {!isMultiple && (
          <p className="text-xs text-gray-500 text-center mt-2">
            You can edit any field by clicking "Edit" next to it
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskPreview;
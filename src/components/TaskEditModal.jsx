import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag, User, Tag } from 'lucide-react';

const TaskEditModal = ({ task, onSave, onClose, darkMode = true }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    project: 'personal',
    assignedTo: 'You',
    tags: [],
    estimatedTime: ''
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (task) {
      const taskDate = new Date(task.dueDate);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: taskDate.toISOString().split('T')[0],
        dueTime: taskDate.toTimeString().slice(0, 5),
        priority: task.priority || 'medium',
        project: task.project || 'personal',
        assignedTo: task.assignedTo || 'You',
        tags: task.tags || [],
        estimatedTime: task.estimatedTime || ''
      });
    }
  }, [task]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    // Combine date and time
    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
    
    const updatedTask = {
      ...task,
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: dueDateTime,
      priority: formData.priority,
      project: formData.project,
      assignedTo: formData.assignedTo,
      tags: formData.tags,
      estimatedTime: formData.estimatedTime,
      updatedAt: new Date()
    };

    onSave(updatedTask);
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`sticky top-0 px-6 py-4 border-b ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Edit Task
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-opacity-80 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Task Title */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Add any additional details..."
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Clock className="w-4 h-4 inline mr-1" />
                Due Time
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Priority and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex items-center mt-2">
                <div className={`w-3 h-3 rounded-full ${priorityColors[formData.priority]} mr-2`}></div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                </span>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Project/Department
              </label>
              <select
                value={formData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="learning">Learning</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
                <option value="family">Family</option>
              </select>
            </div>
          </div>

          {/* Assigned To and Estimated Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <User className="w-4 h-4 inline mr-1" />
                Assigned To
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Who is responsible?"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated Time
              </label>
              <select
                value={formData.estimatedTime}
                onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select duration</option>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hour">1 hour</option>
                <option value="2hours">2 hours</option>
                <option value="4hours">4 hours</option>
                <option value="1day">1 day</option>
                <option value="2days">2 days</option>
                <option value="1week">1 week</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    darkMode 
                      ? 'bg-blue-900/50 text-blue-300' 
                      : 'bg-blue-100 text-blue-800'
                  } flex items-center gap-1`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-xs hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
import React, { useState } from 'react';
import { Clock, Flag, User, Calendar, Tag } from 'lucide-react';

const SmartTaskParser = ({ isOpen, onClose, onCreateTask, parsedData }) => {
  const [taskData, setTaskData] = useState({
    title: parsedData?.title || '',
    priority: parsedData?.priority || '',
    project: parsedData?.project || '',
    dueDate: parsedData?.dueDate ? parsedData.dueDate.toISOString().split('T')[0] : '',
    dueTime: '',
    assignedTo: parsedData?.assignedTo || '',
    description: '',
    estimatedDuration: ''
  });

  const [step, setStep] = useState(0);

  const missingFields = [
    { key: 'priority', label: 'Priority Level', icon: Flag, required: !taskData.priority },
    { key: 'dueTime', label: 'Time', icon: Clock, required: !taskData.dueTime && taskData.dueDate },
    { key: 'assignedTo', label: 'Assign to someone?', icon: User, required: false },
    { key: 'estimatedDuration', label: 'How long will it take?', icon: Clock, required: false }
  ].filter(field => field.required || (!taskData[field.key] && field.key !== 'assignedTo'));

  const currentField = missingFields[step];

  const handleNext = () => {
    if (step < missingFields.length - 1) {
      setStep(step + 1);
    } else {
      // Create the task
      const finalTask = {
        ...taskData,
        dueDate: taskData.dueDate && taskData.dueTime 
          ? new Date(`${taskData.dueDate}T${taskData.dueTime}`)
          : taskData.dueDate 
            ? new Date(taskData.dueDate)
            : new Date(),
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date(),
        type: 'voice',
        tags: []
      };
      
      onCreateTask(finalTask);
      onClose();
    }
  };

  const handleSkip = () => {
    if (step < missingFields.length - 1) {
      setStep(step + 1);
    } else {
      handleNext();
    }
  };

  const renderFieldInput = () => {
    if (!currentField) return null;

    switch (currentField.key) {
      case 'priority':
        return (
          <div className="space-y-3">
            {[
              { value: 'low', label: '🟢 Low Priority', desc: 'Can wait, no rush' },
              { value: 'medium', label: '🟡 Medium Priority', desc: 'Normal importance' },
              { value: 'high', label: '🔴 High Priority', desc: 'Important, do soon' },
              { value: 'urgent', label: '🚨 Urgent', desc: 'Critical, do now!' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTaskData(prev => ({ ...prev, priority: option.value }))}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  taskData.priority === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </button>
            ))}
          </div>
        );

      case 'dueTime':
        return (
          <div className="space-y-4">
            <input
              type="time"
              value={taskData.dueTime}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueTime: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              {['09:00', '12:00', '15:00', '18:00'].map(time => (
                <button
                  key={time}
                  onClick={() => setTaskData(prev => ({ ...prev, dueTime: time }))}
                  className="p-2 text-sm border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        );

      case 'assignedTo':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={taskData.assignedTo}
              onChange={(e) => setTaskData(prev => ({ ...prev, assignedTo: e.target.value }))}
              placeholder="e.g., John Doe, @team, or leave empty for yourself"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-2">
              {['Myself', '@team', 'John Doe', 'Sarah'].map(person => (
                <button
                  key={person}
                  onClick={() => setTaskData(prev => ({ ...prev, assignedTo: person }))}
                  className="p-2 text-sm border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
                >
                  {person}
                </button>
              ))}
            </div>
          </div>
        );

      case 'estimatedDuration':
        return (
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '15min', label: '15 minutes' },
              { value: '30min', label: '30 minutes' },
              { value: '1hour', label: '1 hour' },
              { value: '2hours', label: '2 hours' },
              { value: '4hours', label: '4 hours' },
              { value: '1day', label: '1 day' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTaskData(prev => ({ ...prev, estimatedDuration: option.value }))}
                className={`p-3 text-sm rounded-lg border-2 transition-all ${
                  taskData.estimatedDuration === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !currentField) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <currentField.icon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">{currentField.label}</h2>
          </div>
          
          {/* Task Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Creating task:</p>
            <p className="font-medium text-gray-900">"{taskData.title}"</p>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {step + 1} of {missingFields.length}</span>
              <span>{Math.round(((step + 1) / missingFields.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / missingFields.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderFieldInput()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip
          </button>
          
          <div className="flex items-center space-x-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={currentField.required && !taskData[currentField.key]}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step < missingFields.length - 1 ? 'Next' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTaskParser;
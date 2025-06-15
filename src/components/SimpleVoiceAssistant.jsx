import React, { useState } from 'react';

const SimpleVoiceAssistant = () => {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Review quarterly reports',
      priority: 'high',
      dueDate: new Date(),
      category: 'work',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Buy groceries',
      priority: 'medium',
      dueDate: new Date(),
      category: 'shopping',
      status: 'pending'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🤖 AI Todo Assistant
        </h1>
        <p className="text-gray-300 mt-2">Your futuristic task management companion</p>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800/50 backdrop-blur-sm p-6">
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              🎤 Voice Command
            </button>
            
            <div className="space-y-2">
              <button className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 transition-colors">
                📅 Today ({tasks.length})
              </button>
              <button className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 transition-colors">
                📋 All Tasks
              </button>
              <button className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 transition-colors">
                ✅ Completed
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-200">Today's Tasks</h2>
            
            {tasks.map(task => (
              <div key={task.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <h3 className="font-medium text-white">{task.title}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400 capitalize">{task.category}</span>
                    <button 
                      onClick={() => {
                        setTasks(prev => prev.map(t => 
                          t.id === task.id 
                            ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
                            : t
                        ));
                      }}
                      className="w-6 h-6 rounded-full border-2 border-gray-500 hover:border-green-500 transition-colors flex items-center justify-center"
                    >
                      {task.status === 'completed' && <span className="text-green-500">✓</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add */}
          <div className="mt-8">
            <button 
              onClick={() => {
                const newTask = {
                  id: Date.now().toString(),
                  title: 'New Task',
                  priority: 'medium',
                  dueDate: new Date(),
                  category: 'personal',
                  status: 'pending'
                };
                setTasks(prev => [...prev, newTask]);
              }}
              className="w-full bg-gray-800/50 backdrop-blur-sm border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg p-4 text-gray-400 hover:text-blue-400 transition-colors"
            >
              + Add New Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleVoiceAssistant;
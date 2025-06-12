import React, { useState, useEffect, useCallback } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { ConversationManager } from '../utils/conversationManager';
// import { textToSpeechService } from '../services/textToSpeechService';
// import { taskService } from '../services/taskService';
import { TASK_PRIORITY, TASK_CATEGORY, TASK_STATUS } from '../constants';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import VoiceModal from './VoiceModal';
import QuickAdd from './QuickAdd';

const VoiceTaskAssistant = () => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [multipleTasks, setMultipleTasks] = useState([]);
  const [showTaskPreview, setShowTaskPreview] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState('today');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationManager] = useState(() => new ConversationManager());
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    isListening, 
    transcript, 
    isSupported, 
    error: voiceError, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useVoiceRecognition();

  // Helper function to add messages to conversation
  const addMessage = useCallback((speaker, message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      speaker,
      message,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, newMessage]);
  }, []);

  // Sample data for demonstration
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Temporarily using static data instead of service
        const sampleTasks = [
          {
            id: '1',
            title: 'Review quarterly reports',
            priority: TASK_PRIORITY.HIGH,
            dueDate: new Date(),
            category: TASK_CATEGORY.WORK,
            status: TASK_STATUS.PENDING,
            description: 'Review Q3 financial reports and prepare summary',
            createdAt: new Date(),
            createdBy: 'manual'
          },
          {
            id: '2',
            title: 'Buy groceries for the week',
            priority: TASK_PRIORITY.MEDIUM,
            dueDate: new Date(Date.now() + 86400000), // Tomorrow
            category: TASK_CATEGORY.SHOPPING,
            status: TASK_STATUS.PENDING,
            createdAt: new Date(),
            createdBy: 'manual'
          },
          {
            id: '3',
            title: 'Schedule dentist appointment',
            priority: TASK_PRIORITY.LOW,
            dueDate: new Date(Date.now() + 7 * 86400000), // Next week
            category: TASK_CATEGORY.HEALTH,
            status: TASK_STATUS.COMPLETED,
            createdAt: new Date(),
            createdBy: 'voice'
          }
        ];
        
        setTasks(sampleTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        addMessage('assistant', 'I had trouble loading your tasks. Please try refreshing the page.');
      }
    };
    
    loadTasks();
  }, [addMessage]);

  // Add initial greeting message
  useEffect(() => {
    const initializeAssistant = async () => {
      const greeting = "Hi! I'm your AI task assistant. I can help you create and manage tasks using voice commands. Try saying 'Create a task' or just tell me what you need to do!";
      addMessage('assistant', greeting);
      
      // Initialize text-to-speech service
      try {
        // await textToSpeechService.initialize();
        // TTS service initialization would be here in future versions
      } catch (error) {
        console.error('Failed to initialize text-to-speech:', error);
      }
    };
    
    initializeAssistant();
  }, [addMessage]);

  // Process transcript when it changes
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      const handleTranscript = async () => {
        await processUserInput(transcript);
        resetTranscript();
      };
      handleTranscript();
    }
  }, [transcript, resetTranscript, processUserInput]);

  // Process user input through conversation manager
  const processUserInput = useCallback(async (userInput) => {
    if (!userInput.trim()) {
      return { success: false, message: "No input provided" };
    }

    try {
      // Process through conversation manager
      const response = conversationManager.processUserResponse(userInput);
      
      // Update UI state based on response
      if (response.showTaskPreview && response.taskDraft) {
        setCurrentTask(response.taskDraft);
        setShowTaskPreview(true);
      } else {
        setShowTaskPreview(false);
        setCurrentTask(null);
      }

      // Handle multiple tasks
      if (response.multipleTasks) {
        setMultipleTasks(response.multipleTasks);
      } else {
        setMultipleTasks([]);
      }

      // Handle task saving
      if (response.tasksToSave) {
        const newTasks = response.tasksToSave.map(task => ({
          ...task,
          status: TASK_STATUS.PENDING,
          createdBy: 'voice'
        }));
        
        // Save tasks using the service
        try {
          const savedTasks = [];
          for (const taskData of newTasks) {
            const savedTask = await taskService.createTask(taskData);
            savedTasks.push(savedTask);
          }
          
          // Update local state
          const allTasks = await taskService.getAllTasks();
          setTasks(allTasks);
          
          return {
            success: true,
            type: 'taskCreated',
            task: savedTasks[0],
            message: response.message
          };
        } catch (error) {
          console.error('Error saving tasks:', error);
          return {
            success: false,
            message: "I had trouble saving your task. Please try again."
          };
        }
      }

      // Handle task queries
      if (response.isQuery && response.requestedTasks) {
        return {
          success: true,
          type: 'taskList',
          tasks: response.requestedTasks,
          period: response.period,
          summary: response.summary,
          message: response.message
        };
      }

      // Clear draft if requested
      if (response.clearDraft) {
        setCurrentTask(null);
        setShowTaskPreview(false);
        setMultipleTasks([]);
      }

      return {
        success: true,
        message: response.message,
        type: response.type || 'general'
      };
      
    } catch (error) {
      console.error('Error processing user input:', error);
      return {
        success: false,
        message: "I encountered an error processing your request. Please try again."
      };
    }
  }, [conversationManager]);

  // Handle manual task editing
  const handleTaskEdit = useCallback((field, value) => {
    if (currentTask) {
      const updatedTask = { ...currentTask, [field]: value };
      setCurrentTask(updatedTask);
      
      // Update the conversation manager's task draft
      conversationManager.taskDraft = updatedTask;
    }
  }, [currentTask, conversationManager]);

  // Handle task confirmation
  const handleTaskConfirm = useCallback(async () => {
    await processUserInput('yes');
  }, [processUserInput]);

  // Handle task cancellation
  const handleTaskCancel = useCallback(async () => {
    await processUserInput('cancel');
  }, [processUserInput]);

  // Handle typing instead of voice
  const handleTextInput = useCallback(async (text) => {
    if (!text.trim()) {
      const response = "I didn't understand that. Could you please try again?";
      addToConversation('assistant', response);
      await speakResponse(response);
      return;
    }

    setIsProcessing(true);
    
    // Add user input to conversation
    addToConversation('user', text);
    
    try {
      // Process the user input
      const result = await processUserInput(text);
      
      // Generate appropriate AI response
      let response;
      if (result.success) {
        if (result.type === 'taskCreated') {
          response = `Great! I've created the task "${result.task?.title || 'task'}" for you.`;
        } else if (result.type === 'taskCompleted') {
          response = `Perfect! I've marked "${result.task?.title || 'task'}" as completed.`;
        } else if (result.type === 'taskList') {
          response = `You have ${result.tasks?.length || 0} tasks for ${result.period || 'today'}.`;
        } else {
          response = result.message || "Task processed successfully!";
        }
      } else {
        response = result.message || "I didn't understand that. Could you please try again?";
      }
      
      // Add AI response to conversation and speak it
      addToConversation('assistant', response);
      await speakResponse(response);
      
    } catch (error) {
      console.error('Error processing input:', error);
      const errorResponse = "I'm sorry, I encountered an error processing your request. Please try again.";
      addToConversation('assistant', errorResponse);
      await speakResponse(errorResponse);
    } finally {
      setIsProcessing(false);
    }
  }, [processUserInput]);

  // Enhanced function to add conversations and speak responses
  const addToConversation = useCallback((sender, message) => {
    setConversationHistory(prev => [...prev, {
      id: Date.now(),
      sender,
      message,
      timestamp: new Date()
    }]);
  }, []);

  // Function to speak AI responses
  const speakResponse = useCallback(async (text) => {
    try {
      setIsAISpeaking(true);
      setLastResponse(text);
      
      // Simple speech synthesis without service
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onend = () => setIsAISpeaking(false);
        utterance.onerror = () => setIsAISpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsAISpeaking(false);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsAISpeaking(false);
    }
  }, []);

  // Handle task management (complete, delete, edit)
  const handleTaskAction = useCallback(async (taskId, action, data = null) => {
    try {
      // Simple task management without service
      setTasks(prev => {
        switch (action) {
          case 'complete':
            return prev.map(task => 
              task.id === taskId 
                ? { ...task, status: task.status === TASK_STATUS.COMPLETED ? TASK_STATUS.PENDING : TASK_STATUS.COMPLETED }
                : task
            );
          case 'delete':
            return prev.filter(task => task.id !== taskId);
          case 'edit':
            return prev.map(task => 
              task.id === taskId ? { ...task, ...data } : task
            );
          default:
            return prev;
        }
      });
    } catch (error) {
      console.error('Error performing task action:', error);
      const errorMsg = "I'm sorry, I encountered an error with that action.";
      addToConversation('assistant', errorMsg);
      await speakResponse(errorMsg);
    }
  }, [addToConversation, speakResponse]);

  // Handle voice modal
  const handleVoiceStart = async () => {
    setShowVoiceModal(true);
    
    // Welcome message if first time or no recent conversation
    if (conversationHistory.length === 0) {
      const welcomeMsg = "Hello! I'm ready to help you with your tasks. What would you like to do?";
      addToConversation('assistant', welcomeMsg);
      await speakResponse(welcomeMsg);
    } else {
      const listeningMsg = "I'm listening. How can I help you?";
      addToConversation('assistant', listeningMsg);
      await speakResponse(listeningMsg);
    }
    
    startListening();
  };

  const handleVoiceStop = () => {
    stopListening();
    setShowVoiceModal(false);
  };

  // Handle quick task creation
  const handleQuickAdd = async (taskText) => {
    await processUserInput(taskText);
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Voice Not Supported</h2>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support voice recognition. Please try using Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        tasks={tasks}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onVoiceStart={handleVoiceStart}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Quick Add Bar */}
        <QuickAdd 
          onAddTask={handleQuickAdd}
          onVoiceStart={handleVoiceStart}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content */}
        <MainContent 
          currentView={currentView}
          tasks={tasks}
          onTaskAction={handleTaskAction}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          currentTask={currentTask}
          multipleTasks={multipleTasks}
          showTaskPreview={showTaskPreview}
          onTaskEdit={handleTaskEdit}
          onTaskConfirm={handleTaskConfirm}
          onTaskCancel={handleTaskCancel}
          conversationHistory={conversationHistory}
          isListening={isListening}
        />
      </div>

      {/* Voice Modal */}
      {showVoiceModal && (
        <VoiceModal
          isListening={isListening}
          isAISpeaking={isAISpeaking}
          isProcessing={isProcessing}
          onClose={handleVoiceStop}
          onTextInput={handleTextInput}
          conversationHistory={conversationHistory}
          transcript={transcript}
          error={voiceError}
          lastResponse={lastResponse}
        />
      )}
    </div>
  );
};

export default VoiceTaskAssistant;
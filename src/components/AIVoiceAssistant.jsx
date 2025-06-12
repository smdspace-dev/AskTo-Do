import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Calendar, List, Kanban, Settings, Moon, Sun, Plus, LogOut, Edit3, Clock, Smartphone, Monitor, AlertTriangle, X } from 'lucide-react';
import TaskCreationModal from './TaskCreationModal';
import SmartTaskParser from './SmartTaskParser';
import AuthModal from './AuthModal';
import TaskEditModal from './TaskEditModal';
import databaseService from '../services/DatabaseService';

const AIVoiceAssistant = () => {
  // Core States
  const [tasks, setTasks] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentView, setCurrentView] = useState('today');
  const [selectedProject, setSelectedProject] = useState('personal');
  const [darkMode, setDarkMode] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [voiceInput, setVoiceInput] = useState('');
  
  // Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSmartParser, setShowSmartParser] = useState(false);
  const [parsedTaskData, setParsedTaskData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedQuickDate, setSelectedQuickDate] = useState(null);
  
  // Mobile Detection States
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  
  // User State
  const [user, setUser] = useState(null);
  
  // Voice Recognition References
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize user authentication
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = databaseService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setShowAuthModal(false);
          await loadUserTasks(currentUser.id);
        } else {
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setShowAuthModal(true);
      }
    };
    
    initializeUser();
  }, []);

  // Mobile Detection Effect
  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Check for mobile user agents
      const isMobileAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Check for mobile screen sizes (portrait mode or small screens)
      const isMobileScreen = screenWidth <= 768 || (screenWidth <= 1024 && screenHeight > screenWidth);
      
      // Check for touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const mobileDetected = isMobileAgent || (isMobileScreen && isTouchDevice);
      
      setIsMobile(mobileDetected);
      setShowMobileWarning(mobileDetected);
    };

    // Check on mount
    checkMobileDevice();
    
    // Check on resize
    const handleResize = () => {
      checkMobileDevice();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load user-specific tasks using database service
  const loadUserTasks = async (userId) => {
    try {
      const userTasks = databaseService.getUserTasks(userId);
      
      if (userTasks.length > 0) {
        setTasks(userTasks);
      } else {
        // Load sample tasks for new users
        const sampleTasks = [
          {
            id: '1',
            title: 'Welcome to your AI Todo Assistant!',
            dueDate: new Date(Date.now() + 86400000),
            priority: 'medium',
            project: 'personal',
            status: 'pending',
            createdAt: new Date(),
            type: 'system',
            assignedTo: 'You',
            tags: ['welcome']
          },
          {
            id: '2',
            title: 'Try creating a task using voice',
            dueDate: new Date(Date.now() + 172800000),
            priority: 'low',
            project: 'personal',
            status: 'pending',
            createdAt: new Date(),
            type: 'system',
            assignedTo: 'You',
            tags: ['tutorial']
          },
          {
            id: '3',
            title: 'Debug test task - visible title',
            dueDate: new Date(Date.now() + 86400000),
            priority: 'high',
            project: 'personal',
            status: 'pending',
            createdAt: new Date(),
            type: 'debug',
            assignedTo: 'You',
            tags: ['debug']
          }
        ];
        setTasks(sampleTasks);
        await databaseService.saveAllUserTasks(userId, sampleTasks);
      }
    } catch (error) {
      console.error('Error loading user tasks:', error);
    }
  };

  // Save user-specific tasks using database service
  const saveUserTasks = async (newTasks, userId = user?.id) => {
    if (userId) {
      try {
        await databaseService.saveAllUserTasks(userId, newTasks);
      } catch (error) {
        console.error('Error saving user tasks:', error);
      }
    }
  };

  // Handle user authentication
  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    await loadUserTasks(userData.id);
    speak(`Welcome ${userData.username}! I'm ready to help you manage your tasks.`);
  };

  // Handle user logout
  const handleLogout = () => {
    databaseService.logoutUser();
    setUser(null);
    setTasks([]);
    setShowAuthModal(true);
    setConversation([]);
    setVoiceInput('');
    speak("You've been logged out. Have a great day!");
  };

  // Handle clear tasks with confirmation
  const handleClearTasks = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to clear all your tasks? This action cannot be undone.\n\nYou currently have ${tasks.length} tasks.`
    );
    
    if (confirmed) {
      try {
        await databaseService.clearUserTasks(user.id);
        setTasks([]);
        setConversation([]);
        setVoiceInput('');
        speak("All your tasks have been cleared. Ready to start fresh!");
      } catch (error) {
        console.error('Error clearing tasks:', error);
        alert('Error clearing tasks. Please try again.');
      }
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setVoiceInput(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    synthRef.current = window.speechSynthesis;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update tasks when user changes - ensure proper async handling
  useEffect(() => {
    if (user && tasks.length > 0) {
      // Debounce to avoid excessive saves
      const timeoutId = setTimeout(() => {
        saveUserTasks(tasks);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [tasks, user]);

  // Enhanced task creation functions
  const handleTaskCreation = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pending',
      createdAt: new Date(),
      type: 'enhanced'
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveUserTasks(updatedTasks); // Ensure tasks are saved immediately
    setShowTaskModal(false);
    
    // Reset conversation state after task completion
    setConversation([]);
    setVoiceInput('');
    
    speak(`Task "${taskData.title}" has been created with ${taskData.priority} priority. What's next on your agenda?`);
  };

  const handleSmartTaskCreation = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pending',
      createdAt: new Date(),
      type: 'smart'
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveUserTasks(updatedTasks); // Ensure tasks are saved immediately
    setShowSmartParser(false);
    setParsedTaskData(null);
    
    // Reset conversation state after task completion
    setConversation([]);
    setVoiceInput('');
    
    speak(`Smart task "${taskData.title}" has been created successfully. Ready for your next task!`);
  };

  const openTaskCreationModal = () => {
    setShowTaskModal(true);
  };

  const openSmartParser = (parsedData) => {
    setParsedTaskData(parsedData);
    setShowSmartParser(true);
  };

  const openTaskEditModal = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleTaskEdit = (updatedTask) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    saveUserTasks(updatedTasks); // Ensure tasks are saved immediately
    setShowEditModal(false);
    setEditingTask(null);
    
    // Reset conversation state after task completion
    setConversation([]);
    setVoiceInput('');
    
    speak(`Task "${updatedTask.title}" has been updated successfully. What would you like to do next?`);
  };

  // Voice Command Processing with Enhanced NLP
  const processVoiceCommand = useCallback(async (transcript) => {
    setIsProcessing(true);
    
    try {
      const command = transcript.toLowerCase().trim();
      
      // Enhanced task creation patterns - more comprehensive extraction
      const taskCreationPatterns = [
        // Match full detailed commands like "I want to ride a bike today with high priority add it of details do you need"
        /(?:add|create|make|set|schedule|remind me to|book|need to|want to|have to|i want to)\s+(.+?)(?:\s+(?:today|tomorrow|this week|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday))?(?:\s+with\s+(.+?)\s+priority)?(?:\s+add\s+it\s+of\s+details\s+do\s+you\s+need)?$/i,
        // Match simple commands
        /(?:add|create|make|set|schedule|remind me to|book|need to|want to|have to)\s+(.+?)(?:\s+(?:in|for|with|at|priority|department).*)?$/i,
        /(?:i need to|i want to|i have to|let me)\s+(.+?)(?:\s+(?:in|for|with|at|priority|department).*)?$/i,
        /(?:reminder|task|todo)\s*(?:to)?\s*(.+?)(?:\s+(?:in|for|with|at|priority|department).*)?$/i
      ];
      
      let taskCreated = false;
      
      // Check for enhanced task creation commands first
      if (command.includes('detailed task') || command.includes('complex task') || command.includes('full task')) {
        openTaskCreationModal();
        speak("I'll open the detailed task creation form for you.");
        taskCreated = true;
      } 
      // Check for commands that indicate user wants detailed setup
      else if (command.includes('add it of details') || command.includes('details do you need') || 
               command.includes('what details') || command.includes('need more info')) {
        // Parse the main task from the command
        const fullCommand = transcript.toLowerCase();
        let taskTitle = '';
        let priority = 'medium';
        
        // Extract task title - everything before time/priority indicators
        const titleMatch = fullCommand.match(/(?:i want to|want to|add|create|make)\s+(.+?)(?:\s+(?:today|tomorrow|with|priority))/i);
        if (titleMatch) {
          taskTitle = titleMatch[1].trim();
        } else {
          // Fallback - get everything after the action word
          const fallbackMatch = fullCommand.match(/(?:i want to|want to|add|create|make)\s+(.+)/i);
          if (fallbackMatch) {
            taskTitle = fallbackMatch[1].replace(/\s+(?:today|tomorrow|with|priority|add it|of details|do you need).*$/i, '').trim();
          }
        }
        
        // Extract priority
        if (fullCommand.includes('high priority') || fullCommand.includes('urgent')) {
          priority = 'high';
        } else if (fullCommand.includes('medium priority')) {
          priority = 'medium';
        } else if (fullCommand.includes('low priority')) {
          priority = 'low';
        }
        
        // Extract time
        let dueDate = new Date();
        if (fullCommand.includes('today')) {
          dueDate = new Date();
        } else if (fullCommand.includes('tomorrow')) {
          dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
        
        if (taskTitle && taskTitle.length > 2) {
          const enhancedTask = {
            title: taskTitle,
            priority: priority,
            project: 'personal',
            dueDate: dueDate,
            description: '',
            estimatedTime: '',
            assignedTo: user?.username || 'You',
            tags: []
          };
          
          openSmartParser(enhancedTask);
          speak(`I found "${taskTitle}" with ${priority} priority. Let me help you add all the details you need.`);
          taskCreated = true;
        }
      }
      else if (command.includes('smart task') || command.includes('quick task with details')) {
        // Parse basic info and open smart parser
        const basicTaskData = parseTaskFromVoice(transcript, command);
        if (basicTaskData) {
          openSmartParser(basicTaskData);
          speak("Let me help you complete the task details step by step.");
          taskCreated = true;
        }
      } else {
        // Try each pattern to extract task
        for (const pattern of taskCreationPatterns) {
          const match = command.match(pattern);
          if (match && match[1] && match[1].trim().length > 2) {
            let taskText = match[1].trim();
            
            // Clean up the task text - remove redundant phrases
            taskText = taskText.replace(/\s+(in|for|with|at|priority|department).*$/i, '');
            taskText = taskText.replace(/\s+just\s+a\s+reminder.*$/i, '');
            taskText = taskText.replace(/\s+and\s+priority\s+as.*$/i, '');
            
            // Skip if it's just a question or generic phrase
            if (!taskText.includes('understand') && !taskText.includes('rephrasing') && taskText.length > 3) {
              const task = parseTaskFromVoice(transcript, taskText);
              if (task && task.title.length > 2) {
                // Check if task seems to need more details or has specific requirements
                const needsDetails = command.includes('priority') || command.includes('department') || 
                                   command.includes('urgent') || command.includes('deadline') || 
                                   command.includes('assign') || command.includes('team') ||
                                   command.includes('high') || command.includes('medium') || command.includes('low');
                
                if (needsDetails) {
                  // Extract additional info from the command
                  const enhancedTask = { ...task };
                  
                  // Extract priority
                  if (command.includes('priority as high') || command.includes('high priority')) {
                    enhancedTask.priority = 'high';
                  } else if (command.includes('priority as medium') || command.includes('medium priority')) {
                    enhancedTask.priority = 'medium';
                  } else if (command.includes('priority as low') || command.includes('low priority')) {
                    enhancedTask.priority = 'low';
                  }
                  
                  // Extract department/project
                  if (command.includes('learning department')) {
                    enhancedTask.project = 'learning';
                  } else if (command.includes('work department')) {
                    enhancedTask.project = 'work';
                  }
                  
                  openSmartParser(enhancedTask);
                  speak(`I found "${task.title}" with ${enhancedTask.priority || 'medium'} priority. Let me help you complete the details.`);
                  taskCreated = true;
                  break;
                } else {
                  const newTask = {
                    id: Date.now().toString(),
                    ...task,
                    status: 'pending',
                    createdAt: new Date(),
                    type: 'voice',
                    assignedTo: user?.username || 'You',
                    tags: []
                  };
                  const updatedTasks = [...tasks, newTask];
                  setTasks(updatedTasks);
                  saveUserTasks(updatedTasks); // Save immediately
                  
                  // Debug logging
                  console.log('Task created:', newTask);
                  console.log('Task due date:', new Date(newTask.dueDate).toDateString());
                  console.log('Current view:', currentView);
                  console.log('Today:', new Date().toDateString());
                  
                  // Auto-switch view if task is not for today
                  const taskDate = new Date(newTask.dueDate);
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  
                  if (currentView === 'today' && taskDate.toDateString() !== today.toDateString()) {
                    if (taskDate.toDateString() === tomorrow.toDateString()) {
                      setCurrentView('week'); // Show week view to include tomorrow
                      speak(`Perfect! I've added "${task.title}" to your ${task.project} list for ${formatDate(task.dueDate)} with ${task.priority} priority. I've switched to week view so you can see tomorrow's tasks. What's your next task?`);
                    } else {
                      setCurrentView('all'); // Show all tasks if it's further out
                      speak(`Perfect! I've added "${task.title}" to your ${task.project} list for ${formatDate(task.dueDate)} with ${task.priority} priority. I've switched to all tasks view so you can see it. What's your next task?`);
                    }
                  } else {
                    speak(`Perfect! I've added "${task.title}" to your ${task.project} list for ${formatDate(task.dueDate)} with ${task.priority} priority. What's your next task?`);
                  }
                  
                  // Reset conversation state after task creation
                  setConversation([]);
                  setVoiceInput('');
                  taskCreated = true;
                  break;
                }
              }
            }
          }
        }
      }
      
      if (!taskCreated) {
        // Handle other commands
        if (command.includes('today') || command.includes('schedule') || command.includes('what\'s on')) {
          const todayTasks = tasks.filter(task => 
            new Date(task.dueDate).toDateString() === new Date().toDateString()
          );
          if (todayTasks.length > 0) {
            speak(`You have ${todayTasks.length} tasks for today: ${todayTasks.map(t => t.title).join(', ')}`);
          } else {
            speak("You have no tasks scheduled for today. Great job staying on top of things!");
          }
        }
        else if (command.includes('plan my week') || command.includes('weekly') || command.includes('this week')) {
          const weekTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return taskDate >= today && taskDate <= weekFromNow;
          });
          speak(`This week you have ${weekTasks.length} tasks planned. Your priorities are: ${weekTasks.filter(t => t.priority === 'high').map(t => t.title).join(', ')}`);
        }
        else if (command.includes('complete') || command.includes('done') || command.includes('finished')) {
          speak("Which task would you like to mark as complete? You can say the task name or click on the checkbox.");
        }
        else if (command.includes('delete') || command.includes('remove') || command.includes('cancel')) {
          speak("Which task would you like to remove? You can say the task name or click the delete button.");
        }
        else if (command.includes('help') || command.includes('what can you do')) {
          speak("I can help you add tasks, check your schedule, and manage your to-do list. Try saying things like 'Add call dentist tomorrow' or 'What's my day look like?'");
        }
        else {
          // More helpful fallback responses
          const helpfulResponses = [
            "I can help you add that as a task. Try saying 'Add' followed by what you need to do.",
            "Let me help you create a task for that. What would you like to call it?",
            "I'd be happy to add that to your task list. Can you rephrase it starting with 'Add' or 'Remind me to'?",
            "I can set up a reminder for you. Try saying 'Remind me to' followed by your task."
          ];
          const randomResponse = helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
          speak(randomResponse);
        }
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      speak("I had a technical hiccup. Could you try that again?");
    } finally {
      setIsProcessing(false);
    }
  }, [tasks, user]);

  // Enhanced Task Parsing with better natural language understanding
  const parseTaskFromVoice = (transcript, taskText) => {
    if (!taskText || taskText.length < 2) return null;
    
    const fullTranscript = transcript.toLowerCase();
    let priority = 'medium';
    let project = selectedProject;
    let dueDate = new Date();
    let cleanedTitle = taskText;
    
    // Better priority extraction - check full transcript
    if (fullTranscript.includes('high priority') || fullTranscript.includes('urgent') || fullTranscript.includes('important')) {
      priority = 'high';
    } else if (fullTranscript.includes('medium priority') || fullTranscript.includes('normal priority')) {
      priority = 'medium';
    } else if (fullTranscript.includes('low priority') || fullTranscript.includes('not urgent')) {
      priority = 'low';
    }
    
    // Extract project/category from full transcript
    if (fullTranscript.includes('work') || fullTranscript.includes('office') || fullTranscript.includes('job')) project = 'work';
    if (fullTranscript.includes('personal') || fullTranscript.includes('home') || fullTranscript.includes('myself')) project = 'personal';
    if (fullTranscript.includes('learning') || fullTranscript.includes('study') || fullTranscript.includes('education')) project = 'learning';
    if (fullTranscript.includes('health') || fullTranscript.includes('exercise') || fullTranscript.includes('doctor') || fullTranscript.includes('fitness')) project = 'health';
    if (fullTranscript.includes('family') || fullTranscript.includes('kids') || fullTranscript.includes('children')) project = 'family';
    
    // Clean up the title - remove time and priority indicators
    cleanedTitle = cleanedTitle
      .replace(/\s+with\s+(high|medium|low)\s+priority.*$/i, '')
      .replace(/\s+(high|medium|low)\s+priority.*$/i, '')
      .replace(/\s+add\s+it\s+of\s+details.*$/i, '')
      .replace(/\s+details\s+do\s+you\s+need.*$/i, '')
      .replace(/\s+what\s+details.*$/i, '')
      .replace(/\s+(today|tomorrow|this week|next week).*$/i, '')
      .trim();
    
    // Extract time information with better parsing
    const timePatterns = [
      { pattern: /today/i, days: 0 },
      { pattern: /tomorrow/i, days: 1 },
      { pattern: /next week/i, days: 7 },
      { pattern: /this week/i, days: 3 }, // Mid-week default
      { pattern: /monday/i, days: getDaysUntilDay(1) },
      { pattern: /tuesday/i, days: getDaysUntilDay(2) },
      { pattern: /wednesday/i, days: getDaysUntilDay(3) },
      { pattern: /thursday/i, days: getDaysUntilDay(4) },
      { pattern: /friday/i, days: getDaysUntilDay(5) },
      { pattern: /saturday/i, days: getDaysUntilDay(6) },
      { pattern: /sunday/i, days: getDaysUntilDay(0) }
    ];
    
    for (const { pattern, days } of timePatterns) {
      if (pattern.test(fullTranscript)) {
        dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        break;
      }
    }
    
    // If no time specified and it's evening, default to tomorrow
    const currentHour = new Date().getHours();
    if (!fullTranscript.match(/today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|week/i) && currentHour > 18) {
      dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    return {
      title: cleanedTitle,
      priority,
      project,
      dueDate: dueDate.getTime() < Date.now() ? new Date(Date.now() + 24 * 60 * 60 * 1000) : dueDate,
      description: '',
      estimatedTime: '',
      assignedTo: user?.username || 'You',
      tags: []
    };
  };

  // Helper function to calculate days until a specific weekday
  const getDaysUntilDay = (targetDay) => {
    const today = new Date().getDay();
    const days = targetDay - today;
    return days <= 0 ? days + 7 : days;
  };

  // Text-to-Speech with better voice handling
  const speak = (text) => {
    if (!synthRef.current) return;
    
    setIsSpeaking(true);
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
    
    // Add to conversation
    addToConversation('ai', text);
  };

  // Voice Recognition Controls
  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      setVoiceInput('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Task Management Functions
  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    );
    setTasks(updatedTasks);
    saveUserTasks(updatedTasks); // Save immediately after toggle
    
    // Reset conversation state and provide feedback
    setConversation([]);
    setVoiceInput('');
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      if (newStatus === 'completed') {
        speak(`Great job! "${task.title}" is now complete. What's your next priority?`);
      } else {
        speak(`"${task.title}" has been marked as pending. Need any help with it?`);
      }
    }
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveUserTasks(updatedTasks); // Save immediately after deletion
    
    // Reset conversation state and provide feedback
    setConversation([]);
    setVoiceInput('');
    
    if (taskToDelete) {
      speak(`"${taskToDelete.title}" has been removed from your list. Anything else I can help you with?`);
    }
  };

  // Conversation Management
  const addToConversation = (sender, message) => {
    const newMessage = {
      sender,
      message,
      timestamp: new Date()
    };
    setConversation(prev => [...prev.slice(-4), newMessage]);
  };

  // Date Formatting
  const formatDate = (date) => {
    try {
      const d = new Date(date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (d.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (d.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return d.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Filter tasks based on current view
  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    switch (currentView) {
      case 'today':
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === today.toDateString();
        });
      case 'week':
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate <= weekFromNow;
        });
      case 'all':
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks().filter(task => 
    selectedProject === 'all' ? true : task.project === selectedProject
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Realistic Header */}
      <header className={`backdrop-blur-sm border-b transition-all ${
        darkMode 
          ? 'bg-slate-900/80 border-slate-700/50' 
          : 'bg-white/80 border-gray-200/50'
      } px-6 py-4 shadow-sm`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                TaskFlow AI
              </h1>
              {user && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Welcome back, {user.username}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Development Mobile Test Button */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  setIsMobile(!isMobile);
                  setShowMobileWarning(!isMobile);
                }}
                className={`p-2 rounded-lg transition-colors border border-dashed ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400 border-gray-600' : 'hover:bg-gray-100 text-gray-600 border-gray-400'
                }`}
                title={`Test Mobile: ${isMobile ? 'ON' : 'OFF'}`}
              >
                <Smartphone className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={handleClearTasks}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title="Clear all tasks"
            >
              Clear Tasks
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* View Controls */}
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-2">
              {['today', 'week', 'all'].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === view
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Quick Date Filters and Task Creation */}
            <div className="flex flex-col gap-3">
              {/* Date Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Quick Add For:
                </span>
                {['today', 'tomorrow', 'this-week'].map((dateFilter) => (
                  <button
                    key={dateFilter}
                    onClick={() => {
                      const today = new Date();
                      let targetDate = new Date();
                      
                      if (dateFilter === 'tomorrow') {
                        targetDate.setDate(today.getDate() + 1);
                      } else if (dateFilter === 'this-week') {
                        targetDate.setDate(today.getDate() + 7);
                      }
                      
                      // Open task modal with pre-selected date
                      setSelectedQuickDate(targetDate);
                      openTaskCreationModal();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-blue-600 text-gray-200 border border-gray-600 hover:border-blue-500' 
                        : 'bg-gray-100 hover:bg-blue-100 text-gray-700 border border-gray-300 hover:border-blue-400'
                    } shadow-sm hover:shadow-md`}
                  >
                    {dateFilter === 'today' ? (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        Today
                      </>
                    ) : dateFilter === 'tomorrow' ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Tomorrow
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        This Week
                      </>
                    )}
                  </button>
                ))}
                
                {/* Date Picker */}
                <div className="relative">
                  <input
                    type="date"
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      setSelectedQuickDate(selectedDate);
                      openTaskCreationModal();
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs border transition-all duration-200 cursor-pointer hover:scale-105 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-blue-600 hover:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md`}
                    title="Pick a specific date for your task"
                  />
                  <span className={`absolute -top-6 left-0 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`}>
                    📅 Pick Date
                  </span>
                </div>
              </div>
              
              {/* Task Creation Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={openTaskCreationModal}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } shadow-lg`}
                >
                  <Plus className="w-4 h-4" />
                  Quick Add Task
                </button>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Projects</option>
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="learning">Learning</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="family">Family</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid gap-4">
            {filteredTasks.length === 0 ? (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks found</p>
                <p className="text-sm">Use voice commands or the detailed task button to add some tasks!</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group p-4 rounded-xl border transition-all hover:shadow-lg ${
                    darkMode
                      ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80'
                      : 'bg-white/80 border-gray-200/50 hover:bg-white'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : darkMode
                            ? 'border-gray-600 hover:border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        task.status === 'completed' 
                          ? darkMode ? 'line-through text-gray-500' : 'line-through text-gray-400'
                          : darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {task.title || 'Untitled Task'}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-700 border border-red-200' :
                          task.priority === 'medium' 
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {task.project}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(new Date(task.dueDate))}
                        </span>
                        {task.type === 'voice' && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            🎤 Voice
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openTaskEditModal(task)}
                        className={`p-1 rounded transition-colors ${
                          darkMode 
                            ? 'text-gray-400 hover:text-blue-400' 
                            : 'text-gray-400 hover:text-blue-500'
                        }`}
                        title="Edit task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className={`p-1 rounded transition-colors ${
                          darkMode 
                            ? 'text-gray-400 hover:text-red-400' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Voice Assistant Sidebar */}
        <aside className={`w-80 border-l ${
          darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white/30'
        } backdrop-blur-sm`}>
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <h3 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Voice Assistant
              </h3>
              
              <div className="flex justify-center mb-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || isSpeaking}
                  className={`relative w-16 h-16 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                    isListening 
                      ? 'bg-red-500 shadow-lg shadow-red-500/25' 
                      : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                  } ${isProcessing || isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6 text-white mx-auto" />
                  ) : (
                    <Mic className="w-6 h-6 text-white mx-auto" />
                  )}
                  
                  {isListening && (
                    <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-40"></div>
                  )}
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 gap-2 mb-4">
                <button
                  onClick={openTaskCreationModal}
                  className={`flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } shadow-lg`}
                >
                  <Plus className="w-4 h-4" />
                  Manual Add Task
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const quickTask = {
                        title: '',
                        priority: 'medium',
                        project: 'personal',
                        dueDate: new Date(),
                        description: '',
                        estimatedTime: '',
                        assignedTo: user?.username || 'You',
                        tags: []
                      };
                      openSmartParser(quickTask);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-2 text-xs rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Settings className="w-3 h-3" />
                    Smart Add
                  </button>
                  {user && (
                    <button
                      onClick={handleLogout}
                      className={`flex items-center justify-center gap-1 px-2 py-2 text-xs rounded-lg transition-colors ${
                        darkMode 
                          ? 'bg-red-900/20 hover:bg-red-800/30 text-red-400' 
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <LogOut className="w-3 h-3" />
                      Logout
                    </button>
                  )}
                </div>
              </div>
              
              {voiceInput && (
                <div className={`p-3 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
                }`}>
                  <div className="text-xs text-gray-500 mb-1">Voice Input:</div>
                  {voiceInput}
                </div>
              )}
              
              {isProcessing && (
                <div className={`p-3 rounded-lg text-sm ${
                  darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
                }`}>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
                    Processing...
                  </div>
                </div>
              )}
              
              {isSpeaking && (
                <div className={`p-3 rounded-lg text-sm ${
                  darkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700'
                }`}>
                  <div className="flex items-center">
                    <Mic className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className="ml-2">Speaking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation History */}
            <div className="flex-1">
              <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Conversation
              </h4>
              
              {conversation.length === 0 ? (
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Start a conversation by pressing the microphone button!
                </div>
              ) : (
                <div className="space-y-3">
                  {conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        msg.sender === 'user'
                          ? darkMode
                            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                          : darkMode
                            ? 'bg-gray-700/50 text-gray-300 border border-gray-600'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-medium">
                          {msg.sender === 'user' ? 'You' : 'AI'}
                        </span>
                        <span className="text-xs opacity-60">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal 
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <TaskCreationModal
          isOpen={showTaskModal}
          onCreateTask={handleTaskCreation}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedQuickDate(null); // Reset selected date
          }}
          initialData={selectedQuickDate ? { 
            dueDate: selectedQuickDate.toISOString().split('T')[0] 
          } : {}}
        />
      )}

      {/* Smart Task Parser Modal */}
      {showSmartParser && parsedTaskData && (
        <SmartTaskParser
          isOpen={showSmartParser}
          parsedData={parsedTaskData}
          onCreateTask={handleSmartTaskCreation}
          onClose={() => {
            setShowSmartParser(false);
            setParsedTaskData(null);
          }}
        />
      )}

      {/* Task Edit Modal */}
      {showEditModal && editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleTaskEdit}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Mobile Warning Modal */}
      {showMobileWarning && isMobile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border transform transition-all ${
            darkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
                <h2 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Mobile Experience Notice
                </h2>
              </div>
              <button
                onClick={() => setShowMobileWarning(false)}
                className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="mb-3">
                  <strong>This application is optimized for desktop use.</strong>
                </p>
                <p className="text-sm mb-4">
                  While you can continue on mobile, some features like voice recognition and complex interactions work better on desktop devices with larger screens.
                </p>
              </div>

              {/* Recommendations */}
              <div className="space-y-3 mb-6">
                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <Monitor className={`w-5 h-5 mt-0.5 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div>
                    <h4 className={`font-medium text-sm ${
                      darkMode ? 'text-blue-400' : 'text-blue-800'
                    }`}>
                      Best Experience
                    </h4>
                    <p className={`text-xs ${
                      darkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Use a desktop or laptop computer with Chrome/Firefox for optimal voice recognition and productivity features.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <Smartphone className={`w-5 h-5 mt-0.5 ${
                    darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <div>
                    <h4 className={`font-medium text-sm ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-800'
                    }`}>
                      Mobile Alternative
                    </h4>
                    <p className={`text-xs ${
                      darkMode ? 'text-yellow-300' : 'text-yellow-700'
                    }`}>
                      You can still use manual task creation and basic features, but voice commands may be limited.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowMobileWarning(false)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Continue on Mobile
                </button>
                
                <button
                  onClick={() => {
                    const userAgent = navigator.userAgent;
                    let message = "For the best experience, please:\n\n";
                    
                    if (/iPhone|iPad|iPod/i.test(userAgent)) {
                      message += "• Open this app on a Mac or PC\n• Or request desktop site in Safari settings";
                    } else if (/Android/i.test(userAgent)) {
                      message += "• Open this app on a computer\n• Or enable 'Desktop site' in Chrome menu";
                    } else {
                      message += "• Use a larger screen (tablet in landscape)\n• Or switch to a desktop computer";
                    }
                    
                    alert(message);
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors border ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  How to Switch to Desktop
                </button>
              </div>

              {/* Footer Note */}
              <p className={`text-xs text-center mt-4 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                This message appears only on mobile devices
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIVoiceAssistant;
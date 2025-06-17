import { TaskParser } from './taskParser';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

/**
 * Manages conversation flow and state for the voice assistant
 */
export class ConversationManager {
  constructor() {
    this.state = 'greeting';
    this.taskDraft = {};
    this.pendingTasks = [];
    this.context = {};
    this.missingFields = [];
  }

  /**
   * Process user input and return assistant response
   * @param {string} userInput - What the user said
   * @returns {Object} Response object with message and next state
   */
  processUserResponse(userInput) {
    const input = userInput.toLowerCase().trim();
    
    // Handle cancellation at any time
    if (this.isCancellation(input)) {
      return this.handleCancellation();
    }

    switch (this.state) {
      case 'greeting':
        return this.handleGreeting(input);
      
      case 'collecting_info':
        return this.handleInfoCollection(input);
      
      case 'confirming':
        return this.handleConfirmation(input);
      
      case 'editing':
        return this.handleEditing(input);
      
      default:
        return this.returnToGreeting();
    }
  }

  /**
   * Handle initial greeting and determine user intent
   */
  handleGreeting(input) {
    // Check for task creation intent
    if (this.isTaskCreationIntent(input)) {
      if (this.isMultipleTasksIntent(input)) {
        return this.handleMultipleTasksIntent(input);
      } else {
        return this.handleSingleTaskIntent(input);
      }
    }

    // Default greeting response
    return {
      message: "Hi! I'm your task assistant. I can help you create tasks using your voice. You can say things like:\n\n• 'Create a task'\n• 'I need to add multiple tasks'\n• 'Buy groceries tomorrow'\n• 'Schedule a meeting for Friday'\n\nWhat would you like to do?",
      state: 'greeting',
      showTaskPreview: false
    };
  }

  /**
   * Handle single task creation
   */
  handleSingleTaskIntent(input) {
    try {
      this.taskDraft = TaskParser.parseTaskFromText(input);
      this.taskDraft.id = uuidv4();
      this.missingFields = TaskParser.identifyMissingFields(this.taskDraft);
      
      if (this.missingFields.length === 0) {
        return this.proceedToConfirmation();
      } else {
        this.state = 'collecting_info';
        return this.askForMissingInfo();
      }
    } catch (error) {
      return {
        message: "I had trouble understanding that. Could you tell me what task you'd like to create?",
        state: 'greeting',
        showTaskPreview: false
      };
    }
  }

  /**
   * Handle multiple tasks creation
   */
  handleMultipleTasksIntent(input) {
    try {
      this.pendingTasks = TaskParser.detectMultipleTasks(input);
      
      if (this.pendingTasks.length > 1) {
        // Add IDs to tasks
        this.pendingTasks = this.pendingTasks.map(task => ({
          ...task,
          id: uuidv4()
        }));
        
        return this.confirmMultipleTasks();
      } else {
        // Fall back to single task
        this.taskDraft = this.pendingTasks[0] || {};
        this.taskDraft.id = uuidv4();
        return this.handleSingleTaskIntent(input);
      }
    } catch (error) {
      return {
        message: "I had trouble parsing multiple tasks. Could you try again, or create them one at a time?",
        state: 'greeting',
        showTaskPreview: false
      };
    }
  }

  /**
   * Handle information collection for missing fields
   */
  handleInfoCollection(input) {
    const currentField = this.missingFields[0];
    
    if (currentField === 'dueDate') {
      const extractedDate = TaskParser.extractDate(input);
      if (extractedDate) {
        this.taskDraft.dueDate = extractedDate;
        this.missingFields.shift();
      } else if (input.includes('no date') || input.includes('skip')) {
        this.missingFields.shift(); // Skip this field
      } else {
        return {
          message: "I didn't catch a valid date. You can say things like 'tomorrow', 'next Friday', 'in 3 days', or 'no date' to skip.",
          state: 'collecting_info',
          showTaskPreview: true,
          taskDraft: this.taskDraft
        };
      }
    } else if (currentField === 'category') {
      const extractedCategory = TaskParser.extractCategory(input);
      if (extractedCategory) {
        this.taskDraft.category = extractedCategory;
        this.missingFields.shift();
      } else if (input.includes('skip') || input.includes('no category')) {
        this.missingFields.shift();
      } else {
        // Accept any category the user provides
        this.taskDraft.category = input.trim();
        this.missingFields.shift();
      }
    }

    // Check if we have more fields to collect
    if (this.missingFields.length > 0) {
      return this.askForMissingInfo();
    } else {
      return this.proceedToConfirmation();
    }
  }

  /**
   * Handle confirmation responses
   */
  handleConfirmation(input) {
    if (this.isConfirmation(input)) {
      const tasks = this.pendingTasks.length > 0 ? this.pendingTasks : [this.taskDraft];
      return {
        message: `Perfect! I've created ${tasks.length} task${tasks.length > 1 ? 's' : ''} for you. 🎉\n\nIs there anything else you'd like to add?`,
        state: 'greeting',
        showTaskPreview: false,
        tasksToSave: tasks,
        clearDraft: true
      };
    } else if (this.isRejection(input)) {
      this.state = 'editing';
      return {
        message: "No problem! What would you like to change? You can say things like:\n• 'Change the date to Friday'\n• 'Make it high priority'\n• 'Change the title'\n• 'Start over'",
        state: 'editing',
        showTaskPreview: true,
        taskDraft: this.taskDraft
      };
    } else {
      return {
        message: "I didn't catch that. Please say 'yes' to create the task, or 'no' if you'd like to make changes.",
        state: 'confirming',
        showTaskPreview: true,
        taskDraft: this.taskDraft
      };
    }
  }

  /**
   * Handle editing requests
   */
  handleEditing(input) {
    if (input.includes('start over') || input.includes('cancel')) {
      return this.handleCancellation();
    }

    // Parse editing instructions
    if (input.includes('date') || input.includes('due')) {
      const newDate = TaskParser.extractDate(input);
      if (newDate) {
        this.taskDraft.dueDate = newDate;
        return {
          message: `Got it! Updated the due date to ${format(newDate, 'EEEE, MMMM do')}. Does this look correct now?`,
          state: 'confirming',
          showTaskPreview: true,
          taskDraft: this.taskDraft
        };
      }
    }

    if (input.includes('priority')) {
      const newPriority = TaskParser.extractPriority(input);
      this.taskDraft.priority = newPriority;
      return {
        message: `Updated priority to ${newPriority}. Does this look correct now?`,
        state: 'confirming',
        showTaskPreview: true,
        taskDraft: this.taskDraft
      };
    }

    if (input.includes('title') || input.includes('name')) {
      // Extract new title after "change title to" or similar
      const titleMatch = input.match(/(?:title|name)(?:\s+to)?\s+(.+)/i);
      if (titleMatch) {
        this.taskDraft.title = titleMatch[1].trim();
        return {
          message: `Updated the title to "${this.taskDraft.title}". Does this look correct now?`,
          state: 'confirming',
          showTaskPreview: true,
          taskDraft: this.taskDraft
        };
      }
    }

    return {
      message: "I'm not sure what you'd like to change. Could you be more specific? For example: 'Change the date to Friday' or 'Make it high priority'",
      state: 'editing',
      showTaskPreview: true,
      taskDraft: this.taskDraft
    };
  }

  /**
   * Ask for the next missing piece of information
   */
  askForMissingInfo() {
    const field = this.missingFields[0];
    const questions = {
      dueDate: "When would you like this completed? You can say 'tomorrow', 'next Friday', 'in 3 days', or 'no date' to skip.",
      category: "What category does this belong to? For example: work, personal, shopping, or say 'skip' if you don't want to categorize it."
    };

    return {
      message: questions[field] || "I need a bit more information.",
      state: 'collecting_info',
      showTaskPreview: true,
      taskDraft: this.taskDraft
    };
  }

  /**
   * Proceed to confirmation step
   */
  proceedToConfirmation() {
    this.state = 'confirming';
    const taskSummary = this.formatTaskSummary(this.taskDraft);
    
    return {
      message: `Perfect! Let me confirm what I understood:\n\n${taskSummary}\n\nIs this correct? Say 'yes' to create the task, or 'no' to make changes.`,
      state: 'confirming',
      showTaskPreview: true,
      taskDraft: this.taskDraft
    };
  }

  /**
   * Confirm multiple tasks
   */
  confirmMultipleTasks() {
    this.state = 'confirming';
    let message = `Great! I found ${this.pendingTasks.length} tasks:\n\n`;
    
    this.pendingTasks.forEach((task, index) => {
      message += `${index + 1}. ${this.formatTaskSummary(task)}\n\n`;
    });
    
    message += "Should I create all these tasks? Say 'yes' to confirm, or 'no' if you'd like to make changes.";
    
    return {
      message,
      state: 'confirming',
      showTaskPreview: true,
      taskDraft: this.pendingTasks[0], // Show first task in preview
      multipleTasks: this.pendingTasks
    };
  }

  /**
   * Format task for display
   */
  formatTaskSummary(task) {
    let summary = `📋 ${task.title}`;
    
    if (task.dueDate) {
      summary += `\n📅 Due: ${format(task.dueDate, 'EEEE, MMMM do')}`;
    }
    
    const priorityEmojis = { high: '🔴', medium: '🟡', low: '🟢' };
    summary += `\n⚡ Priority: ${priorityEmojis[task.priority]} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`;
    
    if (task.category) {
      summary += `\n📂 Category: ${task.category}`;
    }
    
    return summary;
  }

  /**
   * Handle cancellation
   */
  handleCancellation() {
    this.resetState();
    return {
      message: "No problem! I've cleared everything. What would you like to do next?",
      state: 'greeting',
      showTaskPreview: false,
      clearDraft: true
    };
  }

  /**
   * Return to greeting state
   */
  returnToGreeting() {
    this.resetState();
    return {
      message: "Let's start fresh. How can I help you with your tasks today?",
      state: 'greeting',
      showTaskPreview: false
    };
  }

  /**
   * Reset conversation state
   */
  resetState() {
    this.state = 'greeting';
    this.taskDraft = {};
    this.pendingTasks = [];
    this.missingFields = [];
    this.context = {};
  }

  // Helper methods for intent detection
  isTaskCreationIntent(input) {
    const keywords = ['create', 'add', 'make', 'new task', 'todo', 'remind', 'schedule'];
    return keywords.some(keyword => input.includes(keyword)) || this.looksLikeTask(input);
  }

  looksLikeTask(input) {
    // Check if input looks like a task (has action verbs, dates, etc.)
    const actionWords = ['buy', 'call', 'email', 'visit', 'finish', 'complete', 'submit', 'send', 'book', 'schedule'];
    const timeWords = ['today', 'tomorrow', 'friday', 'monday', 'week', 'month'];
    
    return actionWords.some(word => input.includes(word)) || 
           timeWords.some(word => input.includes(word));
  }

  isMultipleTasksIntent(input) {
    return input.includes('multiple') || 
           input.includes('several') || 
           input.includes('and ') ||
           input.includes('also ') ||
           input.includes('then ') ||
           /\d+\.\s/.test(input); // numbered lists
  }

  isCancellation(input) {
    return ['cancel', 'never mind', 'stop', 'quit', 'exit'].some(word => input.includes(word));
  }

  isConfirmation(input) {
    return ['yes', 'yeah', 'yep', 'correct', 'right', 'confirm', 'create', 'save'].some(word => input.includes(word));
  }

  isRejection(input) {
    return ['no', 'nope', 'wrong', 'incorrect', 'change', 'edit', 'modify'].some(word => input.includes(word));
  }
}
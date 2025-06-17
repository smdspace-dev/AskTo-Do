import { parse, addDays, addWeeks, addMonths, isValid, startOfDay, endOfDay } from 'date-fns';

/**
 * Utility class for parsing natural language into task objects
 */
export class TaskParser {
  
  /**
   * Parse a text input into a task object
   * @param {string} text - The input text to parse
   * @returns {Object} Parsed task object
   */
  static parseTaskFromText(text) {
    const task = {
      title: '',
      dueDate: null,
      priority: 'medium',
      category: null,
      description: null,
      tags: []
    };

    // Extract title (main task description)
    task.title = this.extractTitle(text);
    
    // Extract due date
    task.dueDate = this.extractDate(text);
    
    // Extract priority
    task.priority = this.extractPriority(text);
    
    // Extract category
    task.category = this.extractCategory(text);
    
    // Extract additional context as description
    task.description = this.extractDescription(text, task.title);

    return task;
  }

  /**
   * Detect and parse multiple tasks from a single input
   * @param {string} text - Input text that may contain multiple tasks
   * @returns {Array} Array of parsed task objects
   */
  static detectMultipleTasks(text) {
    const tasks = [];
    
    // Split by common separators
    const separators = [
      /\band\s+/gi,
      /\bthen\s+/gi,
      /\balso\s+/gi,
      /\bnext\s+/gi,
      /\d+\.\s+/g, // numbered lists
      /,\s+(?=\w)/g // commas followed by words
    ];
    
    let segments = [text];
    
    // Apply each separator
    separators.forEach(separator => {
      const newSegments = [];
      segments.forEach(segment => {
        newSegments.push(...segment.split(separator));
      });
      segments = newSegments.filter(s => s.trim().length > 0);
    });
    
    // If we found multiple segments, parse each one
    if (segments.length > 1) {
      segments.forEach(segment => {
        const trimmed = segment.trim();
        if (trimmed.length > 3) { // Minimum viable task length
          tasks.push(this.parseTaskFromText(trimmed));
        }
      });
    } else {
      // Single task
      tasks.push(this.parseTaskFromText(text));
    }
    
    return tasks.filter(task => task.title.length > 0);
  }

  /**
   * Extract the main task title from text
   * @param {string} text - Input text
   * @returns {string} Extracted title
   */
  static extractTitle(text) {
    // Remove common prefixes and time/priority indicators
    let title = text
      .replace(/^(create|add|make|do|task|todo)\s+/i, '')
      .replace(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
      .replace(/\b(high|medium|low|urgent|important)\s*(priority)?\b/gi, '')
      .replace(/\b(by|due|on|at)\s+/gi, '')
      .replace(/\b(next|this)\s+(week|month|year)\b/gi, '')
      .replace(/\bin\s+\d+\s+(days?|weeks?|months?)\b/gi, '')
      .trim();

    // Clean up extra spaces
    title = title.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter
    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    return title || 'New Task';
  }

  /**
   * Extract due date from natural language
   * @param {string} text - Input text
   * @returns {Date|null} Parsed date or null
   */
  static extractDate(text) {
    const today = new Date();
    const lowerText = text.toLowerCase();

    // Today
    if (lowerText.includes('today')) {
      return today;
    }

    // Tomorrow
    if (lowerText.includes('tomorrow')) {
      return addDays(today, 1);
    }

    // Day names
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDay = today.getDay();
    
    for (let i = 0; i < dayNames.length; i++) {
      if (lowerText.includes(dayNames[i])) {
        let daysUntil = i - todayDay;
        if (daysUntil <= 0) daysUntil += 7; // Next occurrence
        return addDays(today, daysUntil);
      }
    }

    // Next week
    if (lowerText.includes('next week')) {
      return addWeeks(today, 1);
    }

    // This week
    if (lowerText.includes('this week')) {
      return endOfDay(today);
    }

    // End of week
    if (lowerText.includes('end of week') || lowerText.includes('end of the week')) {
      const daysUntilFriday = 5 - todayDay; // Friday
      return addDays(today, daysUntilFriday > 0 ? daysUntilFriday : 7);
    }

    // Next month
    if (lowerText.includes('next month')) {
      return addMonths(today, 1);
    }

    // Relative days (in X days)
    const relativeDaysMatch = lowerText.match(/in\s+(\d+)\s+days?/);
    if (relativeDaysMatch) {
      return addDays(today, parseInt(relativeDaysMatch[1]));
    }

    // Relative weeks (in X weeks)
    const relativeWeeksMatch = lowerText.match(/in\s+(\d+)\s+weeks?/);
    if (relativeWeeksMatch) {
      return addWeeks(today, parseInt(relativeWeeksMatch[1]));
    }

    return null;
  }

  /**
   * Extract priority level from text
   * @param {string} text - Input text
   * @returns {string} Priority level (high, medium, low)
   */
  static extractPriority(text) {
    const lowerText = text.toLowerCase();

    // High priority keywords
    const highKeywords = ['urgent', 'asap', 'critical', 'important', 'high priority', 'high'];
    if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    }

    // Low priority keywords
    const lowKeywords = ['low priority', 'low', 'whenever', 'eventually', 'not urgent'];
    if (lowKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'low';
    }

    // Medium is default
    return 'medium';
  }

  /**
   * Extract category from task text
   * @param {string} text - Input text
   * @returns {string|null} Detected category
   */
  static extractCategory(text) {
    const lowerText = text.toLowerCase();
    
    const categories = {
      'work': ['work', 'office', 'meeting', 'project', 'deadline', 'report', 'presentation'],
      'personal': ['personal', 'self', 'family', 'friend'],
      'shopping': ['buy', 'shop', 'purchase', 'store', 'market', 'groceries'],
      'health': ['doctor', 'dentist', 'appointment', 'exercise', 'workout', 'gym'],
      'home': ['home', 'house', 'clean', 'fix', 'repair', 'organize'],
      'finance': ['bank', 'bill', 'payment', 'invoice', 'tax', 'money'],
      'social': ['call', 'text', 'email', 'visit', 'birthday', 'party']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  /**
   * Extract additional description/context from text
   * @param {string} text - Original text
   * @param {string} title - Extracted title
   * @returns {string|null} Additional description
   */
  static extractDescription(text, title) {
    // Remove the title and common elements to find additional context
    let description = text
      .replace(title, '')
      .replace(/\b(today|tomorrow|high|medium|low|urgent|important)\b/gi, '')
      .trim();

    // Return only if there's meaningful additional content
    return description.length > 5 ? description : null;
  }

  /**
   * Identify which required fields are missing from a task
   * @param {Object} task - Task object to validate
   * @returns {Array} Array of missing field names
   */
  static identifyMissingFields(task) {
    const missing = [];
    
    if (!task.title || task.title.trim().length === 0) {
      missing.push('title');
    }
    
    // Optional fields that we might want to ask about
    if (!task.dueDate) {
      missing.push('dueDate');
    }
    
    if (!task.category) {
      missing.push('category');
    }

    return missing;
  }
}
/**
 * Database Service - Production Data Persistence Layer
 * Handles all user authentication and task management operations
 */

class DatabaseService {
  constructor() {
    this.storagePrefix = 'aiTodoApp_';
    this.isProduction = true; // Production mode enabled
  }

  // User Management
  async createUser(userData) {
    try {
      const users = this.getUsers();
      const existingUser = users.find(user => 
        user.username === userData.username || user.email === userData.email
      );
      
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem(`${this.storagePrefix}users`, JSON.stringify(users));
      localStorage.setItem(`${this.storagePrefix}currentUser`, JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      console.error('Database Service - Create User Error:', error);
      throw error;
    }
  }

  async authenticateUser(username) {
    try {
      
      const users = this.getUsers();
      const user = users.find(u => u.username === username);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      localStorage.setItem(`${this.storagePrefix}users`, JSON.stringify(updatedUsers));
      localStorage.setItem(`${this.storagePrefix}currentUser`, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Database Service - Authenticate User Error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem(`${this.storagePrefix}currentUser`);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Database Service - Get Current User Error:', error);
      // Clear corrupted data
      localStorage.removeItem(`${this.storagePrefix}currentUser`);
      return null;
    }
  }

  logoutUser() {
    localStorage.removeItem(`${this.storagePrefix}currentUser`);
  }

  getUsers() {
    try {
      const users = localStorage.getItem(`${this.storagePrefix}users`);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Database Service - Get Users Error:', error);
      return [];
    }
  }

  // Task Management
  async createTask(userId, taskData) {
    try {
      const tasks = this.getUserTasks(userId);
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      tasks.push(newTask);
      localStorage.setItem(`${this.storagePrefix}tasks_${userId}`, JSON.stringify(tasks));
      
      return newTask;
    } catch (error) {
      console.error('Database Service - Create Task Error:', error);
      throw error;
    }
  }

  async updateTask(userId, taskId, updates) {
    try {
      const tasks = this.getUserTasks(userId);
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`${this.storagePrefix}tasks_${userId}`, JSON.stringify(tasks));
      
      return tasks[taskIndex];
    } catch (error) {
      console.error('Database Service - Update Task Error:', error);
      throw error;
    }
  }

  async deleteTask(userId, taskId) {
    try {
      const tasks = this.getUserTasks(userId);
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      
      localStorage.setItem(`${this.storagePrefix}tasks_${userId}`, JSON.stringify(filteredTasks));
      
      return true;
    } catch (error) {
      console.error('Database Service - Delete Task Error:', error);
      throw error;
    }
  }

  getUserTasks(userId) {
    try {
      const tasks = localStorage.getItem(`${this.storagePrefix}tasks_${userId}`);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Database Service - Get User Tasks Error:', error);
      return [];
    }
  }

  async saveAllUserTasks(userId, tasks) {
    try {
      const updatedTasks = tasks.map(task => ({
        ...task,
        userId,
        updatedAt: new Date().toISOString()
      }));
      
      localStorage.setItem(`${this.storagePrefix}tasks_${userId}`, JSON.stringify(updatedTasks));
      
      return updatedTasks;
    } catch (error) {
      console.error('Database Service - Save All User Tasks Error:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  getUserStats(userId) {
    try {
      const tasks = this.getUserTasks(userId);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      return {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'completed').length,
        pending: tasks.filter(task => task.status === 'pending').length,
        overdue: tasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate < today && task.status !== 'completed';
        }).length,
        todayTasks: tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === today.toDateString();
        }).length
      };
    } catch (error) {
      console.error('Database Service - Get User Stats Error:', error);
      return { total: 0, completed: 0, pending: 0, overdue: 0, todayTasks: 0 };
    }
  }

  // Clear all tasks for a specific user (with confirmation)
  async clearUserTasks(userId) {
    try {
      localStorage.setItem(`${this.storagePrefix}tasks_${userId}`, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Database Service - Clear User Tasks Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
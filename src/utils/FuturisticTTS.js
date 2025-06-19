// Enhanced Text-to-Speech for Futuristic AI Experience
export class FuturisticTTS {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.isSpeaking = false;
    this.queue = [];
    
    // Load voices when available
    this.loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }
  
  loadVoices() {
    this.voices = this.synth.getVoices();
    // Prefer neural/natural voices for futuristic feel
    this.currentVoice = this.voices.find(voice => 
      voice.name.includes('Neural') || 
      voice.name.includes('Natural') ||
      voice.name.includes('Enhanced') ||
      voice.name.includes('Zira') ||
      voice.name.includes('David') ||
      (voice.lang.startsWith('en') && voice.localService)
    ) || this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
  }
  
  async speak(text, options = {}) {
    if (!text) return;
    
    // Add futuristic processing sounds if enabled
    if (options.withProcessingSound) {
      await this.playProcessingSound();
    }
    
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice for futuristic AI feel
      utterance.voice = this.currentVoice;
      utterance.rate = options.rate || 0.95; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1.05; // Slightly higher for AI feel
      utterance.volume = options.volume || 0.9;
      
      // Add pauses for natural conversation
      const processedText = this.addNaturalPauses(text);
      utterance.text = processedText;
      
      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
        if (options.onEnd) options.onEnd();
        resolve();
      };
      
      utterance.onerror = (error) => {
        this.isSpeaking = false;
        if (options.onError) options.onError(error);
        reject(error);
      };
      
      // Add slight delay for more natural feel
      setTimeout(() => {
        this.synth.speak(utterance);
      }, options.delay || 100);
    });
  }
  
  addNaturalPauses(text) {
    // Add SSML-like pauses for more natural speech
    return text
      .replace(/\./g, '.<break time="300ms"/>')
      .replace(/,/g, ',<break time="200ms"/>')
      .replace(/\?/g, '?<break time="400ms"/>')
      .replace(/!/g, '!<break time="400ms"/>');
  }
  
  async playProcessingSound() {
    // Simulate AI processing with subtle sound
    return this.speak("", { rate: 2, pitch: 0.1, volume: 0.1 });
  }
  
  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
  }
  
  // Predefined AI responses for different scenarios
  getResponse(type, context = {}) {
    const responses = {
      welcome: [
        "Hello! I'm your AI assistant. How can I help you manage your tasks today?",
        "Welcome back! Ready to boost your productivity? What would you like to accomplish?",
        "Hi there! I'm here to help you stay organized. What's on your mind?"
      ],
      
      listening: [
        "I'm listening...",
        "Go ahead, I'm ready...",
        "What can I do for you?"
      ],
      
      processing: [
        "Let me process that for you...",
        "Analyzing your request...",
        "Working on it...",
        "Processing your command..."
      ],
      
      taskCreated: [
        `Perfect! I've created the task "${context.task}" for you.`,
        `Task added successfully! "${context.task}" is now in your list.`,
        `Great! I've added "${context.task}" to your tasks.`
      ],
      
      taskCompleted: [
        `Excellent! I've marked "${context.task}" as completed.`,
        `Well done! "${context.task}" is now complete.`,
        `Task completed! Great job on finishing "${context.task}".`
      ],
      
      noUnderstand: [
        "I didn't quite catch that. Could you please repeat your request?",
        "Sorry, I'm not sure I understood. Can you try rephrasing that?",
        "I'm having trouble understanding. Could you say that differently?",
        "Let me try again. What would you like me to help you with?"
      ],
      
      error: [
        "Oops! Something went wrong. Let's try that again.",
        "I encountered an issue. Please try your request once more.",
        "Sorry about that! There was a technical hiccup. Can you repeat that?"
      ],
      
      taskList: [
        `You have ${context.count} tasks ${context.period}. ${context.details}`,
        `Here are your ${context.count} tasks for ${context.period}: ${context.details}`,
        `I found ${context.count} tasks ${context.period}. ${context.details}`
      ],
      
      suggestion: [
        "Would you like me to suggest what to work on next?",
        "I notice you have some high-priority tasks. Should we focus on those?",
        "Based on your schedule, I recommend tackling your urgent tasks first."
      ]
    };
    
    const responseArray = responses[type] || responses.noUnderstand;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  }
}

// Singleton instance
export const aiVoice = new FuturisticTTS();
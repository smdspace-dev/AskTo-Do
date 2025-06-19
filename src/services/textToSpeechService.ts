/**
 * Text-to-Speech Service
 * Industry standard service implementation with proper error handling
 */

import { ISpeechConfig, IServiceResponse } from '../types';
import { VOICE_CONFIG } from '../constants';

export class TextToSpeechService {
  private static instance: TextToSpeechService;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking = false;

  private constructor() {
    this.synth = window.speechSynthesis;
    this.initializeVoices();
  }

  public static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  private initializeVoices(): void {
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      this.selectOptimalVoice();
    };

    loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  private selectOptimalVoice(): void {
    // Priority order for voice selection
    const preferredVoiceNames = [
      'Google US English',
      'Microsoft Zira Desktop',
      'Microsoft David Desktop',
      'Alex',
      'Samantha'
    ];

    // First try to find a preferred voice
    for (const voiceName of preferredVoiceNames) {
      const voice = this.voices.find(v => v.name.includes(voiceName));
      if (voice) {
        this.currentVoice = voice;
        return;
      }
    }

    // Fallback to first English voice
    this.currentVoice = this.voices.find(voice => 
      voice.lang.startsWith('en') && voice.localService
    ) || this.voices.find(voice => 
      voice.lang.startsWith('en')
    ) || this.voices[0] || null;
  }

  private createUtterance(text: string, config: ISpeechConfig = {}): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.voice = this.currentVoice;
    utterance.rate = config.rate || VOICE_CONFIG.SPEECH_RATE;
    utterance.pitch = config.pitch || VOICE_CONFIG.SPEECH_PITCH;
    utterance.volume = config.volume || VOICE_CONFIG.SPEECH_VOLUME;
    
    return utterance;
  }

  private addNaturalPauses(text: string): string {
    return text
      .replace(/\./g, '.<break time="300ms"/>')
      .replace(/,/g, ',<break time="200ms"/>')
      .replace(/\?/g, '?<break time="400ms"/>')
      .replace(/!/g, '!<break time="400ms"/>');
  }

  public async speak(text: string, config: ISpeechConfig = {}): Promise<IServiceResponse<void>> {
    try {
      if (!text.trim()) {
        return {
          success: false,
          error: {
            code: 'EMPTY_TEXT',
            message: 'Text cannot be empty',
            timestamp: new Date()
          }
        };
      }

      if (this.isSpeaking) {
        this.stop();
      }

      const processedText = this.addNaturalPauses(text);
      const utterance = this.createUtterance(processedText, config);

      return new Promise((resolve) => {
        utterance.onstart = () => {
          this.isSpeaking = true;
          config.onStart?.();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          config.onEnd?.();
          resolve({
            success: true,
            message: 'Speech completed successfully'
          });
        };

        utterance.onerror = (event) => {
          this.isSpeaking = false;
          config.onError?.(event);
          resolve({
            success: false,
            error: {
              code: 'SPEECH_ERROR',
              message: `Speech synthesis failed: ${event.error}`,
              timestamp: new Date(),
              context: { event }
            }
          });
        };

        // Add slight delay for more natural speech
        setTimeout(() => {
          this.synth.speak(utterance);
        }, config.delay || 100);
      });

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SPEECH_SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown speech service error',
          timestamp: new Date(),
          context: { error }
        }
      };
    }
  }

  public stop(): void {
    this.synth.cancel();
    this.isSpeaking = false;
  }

  public pause(): void {
    this.synth.pause();
  }

  public resume(): void {
    this.synth.resume();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.currentVoice;
  }

  public setVoice(voice: SpeechSynthesisVoice): void {
    this.currentVoice = voice;
  }

  public isSpeechSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public isSpeechActive(): boolean {
    return this.isSpeaking;
  }

  // Predefined response generation based on context
  public generateResponse(type: string, context: Record<string, any> = {}): string {
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
        "Working on it..."
      ],
      
      taskCreated: [
        `Perfect! I've created the task "${context.task || 'new task'}" for you.`,
        `Task added successfully! "${context.task || 'new task'}" is now in your list.`,
        `Great! I've added "${context.task || 'new task'}" to your tasks.`
      ],
      
      taskCompleted: [
        `Excellent! I've marked "${context.task || 'the task'}" as completed.`,
        `Well done! "${context.task || 'the task'}" is now complete.`,
        `Task completed! Great job on finishing "${context.task || 'the task'}".`
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
        `You have ${context.count || 0} tasks ${context.period || 'today'}. ${context.details || ''}`,
        `Here are your ${context.count || 0} tasks for ${context.period || 'today'}: ${context.details || ''}`,
        `I found ${context.count || 0} tasks ${context.period || 'today'}. ${context.details || ''}`
      ]
    };
    
    const responseArray = responses[type as keyof typeof responses] || responses.noUnderstand;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  }
}

// Export singleton instance
export const textToSpeechService = TextToSpeechService.getInstance();
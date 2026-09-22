import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InterviewService } from '../../services/interview.service';
import { Location } from '@angular/common';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css']
})
export class InterviewComponent implements OnInit, OnDestroy {

  role = '';
  difficulty = '';
  interviewId: number = 0;

  questions: any[] = [];
  currentQuestionIndex = 0;
  currentQuestionObject: any = null;
  currentQuestionText = '';
  displayedText = '';

  userAnswer = '';

  isPaused = false;
  isListening = false;
  isStopped = false;
  isProcessingFeedback = false;
  isFollowUp = false;
  isAiSpeaking = false;
  saveStatus = '';

  showStartModal = true;
  userName = 'Candidate';

  // Voice Persona
  selectedVoicePersona: string = 'natural-female';
  availableVoices: SpeechSynthesisVoice[] = [];

  recognition: any;
  silenceTimer: any;
  typingInterval: any;
  statusTimer: any;

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private interviewService: InterviewService,
    private location: Location
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.role = this.route.snapshot.queryParamMap.get('role') || 'Software Developer';
    this.difficulty = this.route.snapshot.queryParamMap.get('difficulty') || 'medium';

    const idParam = this.route.snapshot.queryParamMap.get('interviewId');
    if (idParam && !isNaN(Number(idParam))) {
      this.interviewId = Number(idParam);
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.name) this.userName = user.name;
      } catch (e) {}
    }

    this.initVoices();
    this.initSpeechRecognition();
    this.loadInterviewQuestions();
  }

  ngOnDestroy(): void {
    this.cleanupSpeech();
  }

  goBack() {
    this.cleanupSpeech();
    this.location.back();
  }

  // ================= VOICE SETUP =================
  initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoicesList();
      window.speechSynthesis.onvoiceschanged = () => {
        this.zone.run(() => {
          this.loadVoicesList();
        });
      };
    }
  }

  loadVoicesList() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.availableVoices = window.speechSynthesis.getVoices();
  }

  getHumanVoice(): SpeechSynthesisVoice | null {
    if (!this.availableVoices || this.availableVoices.length === 0) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.availableVoices = window.speechSynthesis.getVoices();
      }
    }

    const voices = this.availableVoices || [];
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    if (this.selectedVoicePersona === 'natural-female') {
      const preferred = [
        'Ava (Premium)', 'Ava (Enhanced)', 'Ava',
        'Samantha (Enhanced)', 'Samantha',
        'Microsoft Jenny Online (Natural)', 'Microsoft Aria Online (Natural)',
        'Google UK English Female', 'Google US English',
        'Serena', 'Moira', 'Karen', 'Tessa', 'Victoria'
      ];
      for (const name of preferred) {
        const found = pool.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
      const femaleLike = pool.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('natural'));
      if (femaleLike) return femaleLike;
    } else if (this.selectedVoicePersona === 'natural-male') {
      const preferred = [
        'Daniel (Enhanced)', 'Daniel',
        'Alex', 'Tom', 'Oliver',
        'Microsoft Guy Online (Natural)', 'Microsoft Ryan Online (Natural)',
        'Google UK English Male',
        'Google US English'
      ];
      for (const name of preferred) {
        const found = pool.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
      const maleLike = pool.find(v => v.name.toLowerCase().includes('male'));
      if (maleLike) return maleLike;
    }

    return pool.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Enhanced')) || pool[0] || null;
  }

  onVoiceChange(persona: string) {
    this.selectedVoicePersona = persona;
  }

  testVoice() {
    this.speakWithTyping("Hello! I am your AI interviewer. I'm excited to speak with you today.");
  }

  // Clean raw markdown, prompts, scores, asterisks for natural voice
  cleanTextForSpeech(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/^Score:\s*\d+\s*(?:\/\s*10)?/gim, '')
      .replace(/^Feedback:\s*/gim, '')
      .replace(/Next Question:[\s\S]*$/gi, '')
      .replace(/[*#_`~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ================= LOAD / START QUESTIONS =================
  loadInterviewQuestions() {
    if (this.interviewId > 0) {
      this.interviewService.getQuestionsByInterview(this.interviewId).subscribe({
        next: (res: any[]) => {
          if (res && res.length > 0) {
            this.setupQuestions(res);
          } else {
            this.startFreshInterview();
          }
        },
        error: () => {
          this.startFreshInterview();
        }
      });
    } else {
      this.startFreshInterview();
    }
  }

  startFreshInterview() {
    this.interviewService.startInterview(this.role, this.difficulty).subscribe({
      next: (res: any) => {
        if (res?.id) {
          this.interviewId = res.id;
        }
        if (res?.id) {
          this.interviewService.getQuestionsByInterview(res.id).subscribe({
            next: (qList: any[]) => {
              this.setupQuestions(qList || []);
            },
            error: () => this.fallbackQuestions()
          });
        } else {
          this.fallbackQuestions();
        }
      },
      error: () => {
        this.fallbackQuestions();
      }
    });
  }

  fallbackQuestions() {
    this.interviewService.getQuestions(this.role, this.difficulty).subscribe({
      next: (res: any[]) => {
        this.setupQuestions(res || []);
      },
      error: () => {
        this.setupQuestions([
          { id: 1, question: `Can you introduce yourself and describe your experience with ${this.role}?` }
        ]);
      }
    });
  }

  setupQuestions(list: any[]) {
    this.questions = list;
    this.currentQuestionIndex = 0;
    if (this.questions.length > 0) {
      this.setCurrentQuestion();
    }
  }

  setCurrentQuestion() {
    this.currentQuestionObject = this.questions[this.currentQuestionIndex] || {};
    this.currentQuestionText =
      this.currentQuestionObject.question ||
      this.currentQuestionObject.questionText ||
      '';
  }

  // ================= START FROM POPUP =================
  startInterviewFromPopup() {
    this.showStartModal = false;
    this.isStopped = false;

    const greeting = `Hello ${this.userName}. Welcome to your ${this.role} interview. Let's begin with your first question.`;
    this.speakWithTyping(greeting, () => {
      setTimeout(() => {
        this.runQuestion();
      }, 500);
    });
  }

  // ================= ASK QUESTION =================
  runQuestion() {
    if (this.isStopped) return;

    this.userAnswer = '';
    this.setCurrentQuestion();

    this.speakWithTyping(this.currentQuestionText, () => {
      setTimeout(() => {
        this.startListening();
      }, 400);
    });
  }

  // ================= SPEAK + TYPEWRITER =================
  speakWithTyping(text: string, onComplete?: () => void) {
    this.stopListening();

    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.displayedText = '';
    const cleanSpeechText = this.cleanTextForSpeech(text);
    const displayText = text.replace(/^Score:\s*\d+\s*(?:\/\s*10)?/gim, '').replace(/^Feedback:\s*/gim, '').trim();

    let index = 0;
    const speech = new SpeechSynthesisUtterance(cleanSpeechText || text);
    const voice = this.getHumanVoice();
    if (voice) {
      speech.voice = voice;
      speech.lang = voice.lang || 'en-US';
    } else {
      speech.lang = 'en-US';
    }

    speech.rate = 0.98;
    speech.pitch = 1.0;
    speech.volume = 1.0;

    this.isAiSpeaking = true;
    this.cdr.detectChanges();

    speech.onstart = () => {
      this.zone.run(() => {
        this.isAiSpeaking = true;
        const totalDurationMs = Math.max(1000, cleanSpeechText.length * 55);
        const intervalMs = Math.max(25, Math.floor(totalDurationMs / (displayText.length || 1)));

        this.typingInterval = setInterval(() => {
          if (this.isStopped) {
            clearInterval(this.typingInterval);
            return;
          }
          if (index < displayText.length) {
            this.displayedText += displayText.charAt(index);
            index++;
            this.cdr.detectChanges();
          } else {
            clearInterval(this.typingInterval);
          }
        }, intervalMs);
      });
    };

    speech.onend = () => {
      this.zone.run(() => {
        this.isAiSpeaking = false;
        clearInterval(this.typingInterval);
        this.displayedText = displayText;
        this.cdr.detectChanges();

        if (onComplete && !this.isStopped) {
          onComplete();
        }
      });
    };

    speech.onerror = () => {
      this.zone.run(() => {
        this.isAiSpeaking = false;
        clearInterval(this.typingInterval);
        this.displayedText = displayText;
        this.cdr.detectChanges();

        if (onComplete && !this.isStopped) {
          onComplete();
        }
      });
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.speak(speech);
    } else {
      this.displayedText = displayText;
      if (onComplete) onComplete();
    }
  }

  // ================= SPEECH RECOGNITION =================
  initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.zone.run(() => {
        this.isListening = true;
        this.cdr.detectChanges();
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        this.isListening = false;
        this.cdr.detectChanges();
      });
    };

    this.recognition.onresult = (event: any) => {
      if (this.isProcessingFeedback || this.isAiSpeaking) return;

      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      this.zone.run(() => {
        this.userAnswer = transcript;
        this.cdr.detectChanges();
      });

      clearTimeout(this.silenceTimer);
      this.silenceTimer = setTimeout(() => {
        this.handleAnswer();
      }, 2200);
    };

    this.recognition.onerror = () => {
      this.zone.run(() => {
        this.isListening = false;
        this.cdr.detectChanges();
      });
    };
  }

  startListening() {
    if (this.isStopped || this.isAiSpeaking) return;
    try {
      this.recognition?.start();
    } catch {}
  }

  stopListening() {
    try {
      this.recognition?.stop();
    } catch {}
  }

  // ================= SUBMIT AND HANDLE ANSWER =================
  handleAnswer() {
    if (!this.userAnswer.trim() || this.isStopped || this.isProcessingFeedback) {
      return;
    }

    this.isProcessingFeedback = true;
    this.stopListening();
    this.setTemporaryStatus('Evaluating answer & saving feedback to database...');

    const currentQ = this.currentQuestionObject || this.questions[this.currentQuestionIndex] || {};
    const answeredText = this.userAnswer;
    const wasFollowUp = this.isFollowUp;

    const payload = {
      interviewId: this.interviewId,
      questionId: currentQ.id || 1,
      answerText: answeredText,
      role: this.role,
      difficulty: this.difficulty
    };

    console.log('Submitting answer to DB:', payload);

    this.interviewService.submitAnswer(payload).subscribe({
      next: (res: any) => {
        const score = res?.score ?? 7;
        const feedback = res?.feedback?.trim() || 'Good response.';
        this.setTemporaryStatus(`✓ Saved to DB • Score: ${score}/10`);

        const cleanFeedback = this.cleanTextForSpeech(feedback);

        if (!wasFollowUp) {
          // Speak feedback for initial response, then ask ONE intelligent follow-up
          this.speakWithTyping(cleanFeedback, () => {
            this.interviewService.getFollowUp(this.currentQuestionText, answeredText).subscribe({
              next: (followQ: any) => {
                const followClean = (typeof followQ === 'string' ? followQ : followQ?.question || '')
                  .replace(/[*#]/g, '')
                  .trim();

                const finalQ = "Alright. " + (followClean || "Can you give a practical scenario where you applied this?");
                this.userAnswer = '';
                this.isFollowUp = true;

                this.speakWithTyping(finalQ, () => {
                  this.isProcessingFeedback = false;
                  this.startListening();
                });
              },
              error: () => {
                this.isProcessingFeedback = false;
                this.isFollowUp = false;
                this.nextQuestion();
              }
            });
          });
        } else {
          // Follow-up answer completed -> proceed to next question
          this.isFollowUp = false;
          this.userAnswer = '';

          this.speakWithTyping(cleanFeedback, () => {
            setTimeout(() => {
              this.isProcessingFeedback = false;
              this.nextQuestion();
            }, 600);
          });
        }
      },
      error: (err: any) => {
        console.error('Answer submission error:', err);
        this.setTemporaryStatus('Answer recorded.');
        this.isProcessingFeedback = false;
        this.isFollowUp = false;

        this.speakWithTyping("Thank you for your answer. Let's move on to the next question.", () => {
          this.nextQuestion();
        });
      }
    });
  }

  setTemporaryStatus(msg: string) {
    this.saveStatus = msg;
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      this.saveStatus = '';
      this.cdr.detectChanges();
    }, 4000);
    this.cdr.detectChanges();
  }

  // ================= NEXT QUESTION =================
  nextQuestion() {
    if (this.isStopped) return;

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.runQuestion();
    } else {
      this.finishInterview();
    }
  }

  // ================= STOP / RESUME / FINISH =================
  stopInterview() {
    this.isPaused = true;
    this.isStopped = true;
    this.isListening = false;
    this.isProcessingFeedback = false;
    this.isAiSpeaking = false;

    this.cleanupSpeech();
    this.displayedText += "\n\n⏸ Interview Paused";
    this.cdr.detectChanges();
  }

  resumeInterview() {
    this.isPaused = false;
    this.isStopped = false;
    this.displayedText = '';

    setTimeout(() => {
      this.runQuestion();
    }, 300);
  }

  finishInterview() {
    this.cleanupSpeech();
    this.displayedText = '🎉 Interview Completed Successfully! Your answers and AI evaluations have been saved to your History.';
    this.speakWithTyping('Congratulations! Your interview is complete, and your evaluation has been saved.');
  }

  cleanupSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.stopListening();
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.statusTimer) clearTimeout(this.statusTimer);
  }
}
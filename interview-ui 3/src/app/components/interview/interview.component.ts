import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewService } from '../../services/interview.service';
import { Location } from '@angular/common';

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
  isManualEditing = false;

  isPaused = false;
  isListening = false;
  shouldBeListening = false;
  isStopped = false;
  isProcessingFeedback = false;
  isFollowUp = false;
  isAiSpeaking = false;
  saveStatus = '';
  isInterviewComplete = false;

  latestScore: number | null = null;
  latestFeedback: string = '';

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
    private router: Router,
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

  goBack(): void {
    this.cleanupSpeech();
    this.location.back();
  }

  goToDashboard(): void {
    this.cleanupSpeech();
    this.router.navigate(['/dashboard']);
  }

  goToHistory(): void {
    this.cleanupSpeech();
    this.router.navigate(['/history']);
  }

  // ================= VOICE SETUP =================
  initVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoicesList();
      window.speechSynthesis.onvoiceschanged = () => {
        this.zone.run(() => {
          this.loadVoicesList();
        });
      };
    }
  }

  loadVoicesList(): void {
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

  onVoiceChange(persona: string): void {
    this.selectedVoicePersona = persona;
  }

  testVoice(): void {
    this.speakWithTyping("Hello! I am your AI interviewer. I'm ready to conduct your interview session today.");
  }

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
  loadInterviewQuestions(): void {
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

  startFreshInterview(): void {
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

  fallbackQuestions(): void {
    this.interviewService.getQuestions(this.role, this.difficulty).subscribe({
      next: (res: any[]) => {
        this.setupQuestions(res || []);
      },
      error: () => {
        this.setupQuestions([
          { id: 1, question: `Can you introduce yourself and describe your technical experience as a ${this.role}?` }
        ]);
      }
    });
  }

  setupQuestions(list: any[]): void {
    this.questions = list;
    this.currentQuestionIndex = 0;
    if (this.questions.length > 0) {
      this.setCurrentQuestion();
    }
  }

  setCurrentQuestion(): void {
    this.currentQuestionObject = this.questions[this.currentQuestionIndex] || {};
    this.currentQuestionText =
      this.currentQuestionObject.question ||
      this.currentQuestionObject.questionText ||
      '';
  }

  get progressPercentage(): number {
    if (!this.questions || this.questions.length === 0) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100);
  }

  // ================= START FROM POPUP =================
  startInterviewFromPopup(): void {
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
  runQuestion(): void {
    if (this.isStopped) return;

    this.userAnswer = '';
    this.isFollowUp = false;
    this.setCurrentQuestion();

    this.speakWithTyping(this.currentQuestionText, () => {
      setTimeout(() => {
        this.startListening();
      }, 450);
    });
  }

  // ================= SPEAK + TYPEWRITER =================
  speakWithTyping(text: string, onComplete?: () => void): void {
    this.stopListening();

    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
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
        const totalDurationMs = Math.max(1200, cleanSpeechText.length * 52);
        const intervalMs = Math.max(22, Math.floor(totalDurationMs / (displayText.length || 1)));

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

  // ================= SPEECH RECOGNITION (PROPER VOICE CAPTURE) =================
  initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser environment.');
      return;
    }

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
        // Continuous auto-restart: Keep listening if candidate is still answering
        if (this.shouldBeListening && !this.isProcessingFeedback && !this.isAiSpeaking && !this.isStopped) {
          try {
            this.recognition.start();
            this.isListening = true;
          } catch {
            this.isListening = false;
          }
        } else {
          this.isListening = false;
        }
        this.cdr.detectChanges();
      });
    };

    this.recognition.onresult = (event: any) => {
      if (this.isProcessingFeedback || this.isAiSpeaking) return;

      // ACCUMULATE COMPLETE TRANSCRIPT ACROSS ALL PHRASES (Fixes sentence wipe-out bug)
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim();

      this.zone.run(() => {
        if (fullTranscript.length > 0) {
          this.userAnswer = fullTranscript;
        }
        this.cdr.detectChanges();
      });

      // Natural pause detection: Auto-submits after 3.2 seconds of silence once candidate has spoken
      clearTimeout(this.silenceTimer);
      if (this.userAnswer.trim().length > 3) {
        this.silenceTimer = setTimeout(() => {
          this.zone.run(() => {
            this.handleAnswer();
          });
        }, 3200);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.zone.run(() => {
        // Ignore harmless 'no-speech' timeout and continue listening
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
        this.cdr.detectChanges();
      });
    };
  }

  startListening(): void {
    if (this.isStopped || this.isAiSpeaking || this.isProcessingFeedback) return;
    this.shouldBeListening = true;
    try {
      this.recognition?.start();
    } catch {}
    this.isListening = true;
    this.cdr.detectChanges();
  }

  stopListening(): void {
    this.shouldBeListening = false;
    clearTimeout(this.silenceTimer);
    try {
      this.recognition?.stop();
    } catch {}
    this.isListening = false;
    this.cdr.detectChanges();
  }

  /**
   * Allows the candidate to immediately submit their answer without waiting for the silence timer
   */
  finishAndSubmitAnswer(): void {
    if (!this.userAnswer.trim() || this.isProcessingFeedback) return;
    clearTimeout(this.silenceTimer);
    this.handleAnswer();
  }

  /**
   * Resets spoken answer and re-opens mic
   */
  clearCurrentAnswer(): void {
    clearTimeout(this.silenceTimer);
    this.userAnswer = '';
    this.startListening();
  }

  // ================= SUBMIT AND HANDLE ANSWER =================
  handleAnswer(): void {
    if (!this.userAnswer.trim() || this.isStopped || this.isProcessingFeedback) {
      return;
    }

    this.isProcessingFeedback = true;
    this.stopListening();
    this.setTemporaryStatus('Evaluating answer & saving feedback...');

    const currentQ = this.currentQuestionObject || this.questions[this.currentQuestionIndex] || {};
    const answeredText = this.userAnswer.trim();
    const wasFollowUp = this.isFollowUp;
    const evaluatedQuestionText = this.currentQuestionText; // Accurate question being answered

    const payload = {
      interviewId: this.interviewId,
      questionId: currentQ.id || 1,
      questionText: evaluatedQuestionText,
      answerText: answeredText,
      role: this.role,
      difficulty: this.difficulty
    };

    console.log('Submitting answer to DB:', payload);

    this.interviewService.submitAnswer(payload).subscribe({
      next: (res: any) => {
        const score = res?.score ?? 7;
        const feedback = res?.feedback?.trim() || 'Good response.';
        this.latestScore = score;
        this.latestFeedback = feedback;

        this.setTemporaryStatus(`✓ Saved • Score: ${score}/10`);

        const cleanFeedback = this.cleanTextForSpeech(feedback);

        if (!wasFollowUp) {
          // Speak feedback for initial response, then ask ONE intelligent follow-up
          this.speakWithTyping(cleanFeedback, () => {
            this.interviewService.getFollowUp(evaluatedQuestionText, answeredText).subscribe({
              next: (followQ: any) => {
                const followClean = (typeof followQ === 'string' ? followQ : followQ?.question || '')
                  .replace(/[*#_`~]/g, '')
                  .trim();

                const finalQ = "Alright. " + (followClean || "Can you give a practical scenario where you applied this in a project?");
                this.userAnswer = '';
                this.isFollowUp = true;
                this.currentQuestionText = finalQ; // CRITICAL: Updates current question text for follow-up

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

  setTemporaryStatus(msg: string): void {
    this.saveStatus = msg;
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      this.saveStatus = '';
      this.cdr.detectChanges();
    }, 4500);
    this.cdr.detectChanges();
  }

  // ================= NEXT QUESTION =================
  nextQuestion(): void {
    if (this.isStopped) return;

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.runQuestion();
    } else {
      this.finishInterview();
    }
  }

  // ================= STOP / RESUME / FINISH =================
  stopInterview(): void {
    this.isPaused = true;
    this.isStopped = true;
    this.shouldBeListening = false;
    this.isListening = false;
    this.isProcessingFeedback = false;
    this.isAiSpeaking = false;

    this.cleanupSpeech();
    this.displayedText += "\n\n⏸ Interview Paused";
    this.cdr.detectChanges();
  }

  resumeInterview(): void {
    this.isPaused = false;
    this.isStopped = false;
    this.displayedText = '';

    setTimeout(() => {
      this.runQuestion();
    }, 300);
  }

  finishInterview(): void {
    this.cleanupSpeech();
    this.isInterviewComplete = true;
    this.displayedText = '🎉 Interview Completed Successfully! Your answers and AI evaluations have been saved to your History.';
    this.speakWithTyping('Congratulations! Your interview is complete, and your evaluation has been saved to your history.');
  }

  cleanupSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.stopListening();
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.statusTimer) clearTimeout(this.statusTimer);
  }
}
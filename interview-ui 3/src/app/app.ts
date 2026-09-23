import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  readonly themeService = inject(ThemeService);

  @ViewChild('dayVideo') dayVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('nightVideo') nightVideoRef?: ElementRef<HTMLVideoElement>;

  private interactionArmed = false;
  private readonly boundInteractionTrigger = () => this.handleFirstInteraction();
  private readonly boundVisibilityChange = () => this.handleVisibilityChange();

  get isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  ngAfterViewInit(): void {
    this.configureVideos();
    this.syncVideoPlayback();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.boundVisibilityChange);
    }
  }

  ngOnDestroy(): void {
    this.disarmInteractionTrigger();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    // Use microtask so DOM classes update first, then synchronize playback
    setTimeout(() => {
      this.syncVideoPlayback();
    }, 50);
  }

  /**
   * Configures DOM-level properties essential for mobile autoplay (especially iOS WebKit)
   */
  private configureVideos(): void {
    const day = this.dayVideoRef?.nativeElement;
    const night = this.nightVideoRef?.nativeElement;

    [day, night].forEach(video => {
      if (video) {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', 'true');
      }
    });
  }

  /**
   * Activates and plays the active theme video while pausing the inactive video
   * to conserve GPU and battery on mobile devices.
   */
  private syncVideoPlayback(): void {
    const isDark = this.isDarkMode;
    const activeVideo = isDark ? this.nightVideoRef?.nativeElement : this.dayVideoRef?.nativeElement;
    const inactiveVideo = isDark ? this.dayVideoRef?.nativeElement : this.nightVideoRef?.nativeElement;

    if (inactiveVideo && !inactiveVideo.paused) {
      try {
        inactiveVideo.pause();
      } catch {
        // Ignore pause errors
      }
    }

    if (activeVideo) {
      activeVideo.muted = true;
      activeVideo.defaultMuted = true;

      const playPromise = activeVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((_err) => {
          // Autoplay blocked by mobile browser or low-power mode.
          // Arm universal user interaction listener to play on first touch.
          this.armInteractionTrigger();
        });
      }
    }
  }

  /**
   * Resumes playback when the browser tab becomes visible again
   */
  private handleVisibilityChange(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.syncVideoPlayback();
    }
  }

  /**
   * Loops seamlessly if browser drops loop event
   */
  onVideoEnded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }

  /**
   * Fallback for low-power mode or strict mobile autoplay restrictions:
   * Play video immediately upon first user touch or interaction on screen.
   */
  private armInteractionTrigger(): void {
    if (this.interactionArmed || typeof window === 'undefined') return;
    this.interactionArmed = true;

    const events = ['touchstart', 'touchend', 'click', 'scroll', 'pointerdown'];
    events.forEach(evt => {
      window.addEventListener(evt, this.boundInteractionTrigger, { once: true, passive: true });
    });
  }

  private disarmInteractionTrigger(): void {
    if (typeof window === 'undefined') return;
    const events = ['touchstart', 'touchend', 'click', 'scroll', 'pointerdown'];
    events.forEach(evt => {
      window.removeEventListener(evt, this.boundInteractionTrigger);
    });
    this.interactionArmed = false;
  }

  private handleFirstInteraction(): void {
    this.disarmInteractionTrigger();
    this.syncVideoPlayback();
  }
}

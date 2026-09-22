import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'interview-app-theme';
  
  // Default to 'dark' mode as requested
  readonly currentTheme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  private getInitialTheme(): AppTheme {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'dark'; // Default to dark mode with the night video
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      } else {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      }
    }
  }
}

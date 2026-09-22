import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  baseItems = [
    { title: 'JAVA', icon: '☕', desc: 'Backend Logic' },
    { title: 'DSA', icon: '🧠', desc: 'Problem Solving' },
    { title: 'SQL', icon: '🗄️', desc: 'Database Query' },
    { title: 'API', icon: '🔗', desc: 'REST Services' },
    { title: 'AI', icon: '🤖', desc: 'Smart Analysis' },
    { title: 'HR', icon: '💬', desc: 'Communication' },
    { title: 'SPRING', icon: '🌱', desc: 'Framework' },
    { title: 'ANGULAR', icon: '⚙️', desc: 'Frontend UI' }
  ];

  items = Array.from({ length: 60 }).map((_, i) =>
    this.baseItems[i % this.baseItems.length]
  );

  activeIndex = -1;

  ngOnInit() {
    setInterval(() => {
      this.activeIndex = Math.floor(Math.random() * this.items.length);
    }, 800);
  }

  onMouseMove(event: MouseEvent) {
    const grid = document.querySelector('.vhs-grid') as HTMLElement;

    if (!grid) return;

    const x = (event.clientX / window.innerWidth - 0.5) * 20;
    const y = (event.clientY / window.innerHeight - 0.5) * 20;

    grid.style.transform = `translate(${x}px, ${y}px)`;
  }
}
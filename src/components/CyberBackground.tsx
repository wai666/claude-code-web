import { onMount, onCleanup } from 'solid-js';

export default function CyberBackground() {
  let canvasRef: HTMLCanvasElement | undefined;
  let animationId: number;

  onMount(() => {
    if (!canvasRef) return;

    const canvas = canvasRef;
    const ctx = canvas.getContext('2d')!;

    // 设置画布大小
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 粒子系统
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -Math.random() * 2 - 1;
        this.size = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? '#00ff41' : '#00d9ff';
        this.life = 0;
        this.maxLife = Math.random() * 100 + 100;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        return this.life < this.maxLife && this.y > -10;
      }

      draw() {
        const alpha = 1 - this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 数字雨
    class MatrixRain {
      x: number;
      y: number;
      speed: number;
      chars: string;
      fontSize: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 3 + 2;
        this.chars = '01';
        this.fontSize = 14;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        const char = this.chars[Math.floor(Math.random() * this.chars.length)];
        ctx.font = `${this.fontSize}px 'Share Tech Mono'`;
        ctx.fillStyle = '#00ff41';
        ctx.globalAlpha = 0.3;
        ctx.fillText(char, this.x, this.y);
        ctx.globalAlpha = 1;
      }
    }

    // 网格线
    class GridLine {
      y: number;
      speed: number;
      opacity: number;

      constructor() {
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = 0;
        }
      }

      draw() {
        ctx.strokeStyle = '#00ff41';
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(canvas.width, this.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // 初始化
    const particles: Particle[] = [];
    const matrixRains: MatrixRain[] = [];
    const gridLines: GridLine[] = [];

    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    for (let i = 0; i < 30; i++) {
      matrixRains.push(new MatrixRain());
    }

    for (let i = 0; i < 20; i++) {
      gridLines.push(new GridLine());
    }

    // 动画循环
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制网格线
      gridLines.forEach(line => {
        line.update();
        line.draw();
      });

      // 绘制数字雨
      matrixRains.forEach(rain => {
        rain.update();
        rain.draw();
      });

      // 绘制粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (!particle.update()) {
          particles.splice(i, 1);
          particles.push(new Particle());
        }
        particle.draw();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    onCleanup(() => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    });
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        'pointer-events': 'none',
        'z-index': 0,
      }}
    />
  );
}

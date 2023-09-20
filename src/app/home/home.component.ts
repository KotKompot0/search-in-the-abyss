import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', { static: true }) canvasRef: ElementRef;
  private ctx: CanvasRenderingContext2D;

  mazeWidth = 10;
  mazeHeight = 10;
  cellSize: number;
  maze: string[][] = [
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    ['W', ' ', 'W', ' ', ' ', ' ', 'W', ' ', ' ', 'W'],
    ['W', ' ', 'W', 'W', 'W', ' ', 'W', 'W', ' ', 'W'],
    ['W', ' ', ' ', ' ', 'W', ' ', ' ', ' ', ' ', 'W'],
    ['W', 'W', 'W', ' ', 'W', ' ', 'W', 'W', ' ', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', 'W', ' ', ' ', 'W'],
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', ' ', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
    ['W', ' ', 'W', 'W', 'W', ' ', 'W', 'W', 'W', 'W'],
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
];

  visited: boolean[][];
  availableMoves: boolean[][];
  totalKeys = 3;
  keys: { x: number; y: number }[] = [];
  exitX: number;
  exitY: number;
  playerX: number;
  playerY: number;
  keysFound = 0;

  ngOnInit() {
    this.cellSize = this.canvasRef.nativeElement.width / this.mazeWidth;
    this.visited = Array.from(Array(this.mazeHeight), () => Array(this.mazeWidth).fill(false));
    this.availableMoves = Array.from(Array(this.mazeHeight), () => Array(this.mazeWidth).fill(false));

    for (let i = 0; i < this.totalKeys; i++) {
      let keyX, keyY;
      do {
        keyX = Math.floor(Math.random() * this.mazeWidth);
        keyY = Math.floor(Math.random() * this.mazeHeight);
      } while (this.maze[keyY][keyX] !== ' ');

      this.keys.push({ x: keyX, y: keyY });
    }

    do {
      this.exitX = Math.floor(Math.random() * this.mazeWidth);
      this.exitY = Math.floor(Math.random() * this.mazeHeight);
    } while (this.maze[this.exitY][this.exitX] !== ' ');

    this.playerX = Math.floor(this.mazeWidth / 2);
    this.playerY = Math.floor(this.mazeHeight / 2);
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.drawMaze();
  }

  drawMaze() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        if (this.visited[y][x] || cell === 'E' || (x === this.exitX && y === this.exitY && this.isNearby(x, y, this.playerX, this.playerY))) {
          ctx.fillStyle = 'white';
          ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        } else {
          ctx.fillStyle = 'black';
          ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }

        // Отобразить игрока (красным цветом)
        if (x === this.playerX && y === this.playerY) {
          ctx.fillStyle = 'red';
          ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }

        // Отобразить доступные клетки (светло-серым цветом)
        if (this.availableMoves[y][x] && !this.visited[y][x]) {
          ctx.fillStyle = 'lightgray';
          ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }

        // Проверяем, есть ли ключ на текущей клетке и игрок находится рядом
        this.keys.forEach((key) => {
          if (x === key.x && y === key.y && this.isNearby(x, y, this.playerX, this.playerY)) {
            ctx.fillStyle = 'gold';
            ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
          }
        });
      }
    }
  }

  isNearby(x1: number, y1: number, x2: number, y2: number): boolean {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    let newX, newY;
    switch (event.key) {
        case 'ArrowUp':
            newX = this.playerX;
            newY = this.playerY - 1;
            break;
        case 'ArrowDown':
            newX = this.playerX;
            newY = this.playerY + 1;
            break;
        case 'ArrowLeft':
            newX = this.playerX - 1;
            newY = this.playerY;
            break;
        case 'ArrowRight':
            newX = this.playerX + 1;
            newY = this.playerY;
            break;
        default:
            return;
    }

    if (this.isValidMove(newX, newY)) {
      this.playerX = newX;
      this.playerY = newY;
      this.visited[this.playerY][this.playerX] = true;

      // Проверяем, есть ли ключ на текущей клетке
      const keyIndex = this.keys.findIndex((key) => key.x === this.playerX && key.y === this.playerY);
      if (keyIndex !== -1) {
          this.keys.splice(keyIndex, 1);
          this.keysFound++;
      }

      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.calculateAvailableMoves(this.playerX, this.playerY);
      this.drawMaze();
  }

    // Проверяем, достиг ли игрок выхода
    if (this.maze[this.playerY][this.playerX] === 'E' && this.keys.length === 0) {
      alert('Поздравляем! Вы нашли выход и подобрали все ключи!');
    }
  }

 isValidMove(x: number, y: number) {
    return (
        x >= 0 &&
        x < this.mazeWidth &&
        y >= 0 &&
        y < this.mazeHeight &&
        this.maze[y][x] !== 'W'
    );
}

// Вычисляем доступные ходы из текущей позиции игрока
calculateAvailableMoves(x: number, y: number) {
    // Сбрасываем доступные ходы
    for (let i = 0; i < this.mazeHeight; i++) {
        for (let j = 0; j < this.mazeWidth; j++) {
            this.availableMoves[i][j] = false;
        }
    }

    // Вверх
    if (this.isValidMove(x, y - 1)) {
        this.availableMoves[y - 1][x] = true;
    }
    // Вниз
    if (this.isValidMove(x, y + 1)) {
        this.availableMoves[y + 1][x] = true;
    }
    // Влево
    if (this.isValidMove(x - 1, y)) {
        this.availableMoves[y][x - 1] = true;
    }
    // Вправо
    if (this.isValidMove(x + 1, y)) {
        this.availableMoves[y][x + 1] = true;
    }
}
}
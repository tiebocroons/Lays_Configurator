// Simple pattern generator
const fs = require('fs');
const { createCanvas } = require('canvas');

const patterns = {
  stripes: (ctx, width, height) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < width; i += 20) {
      ctx.fillRect(i, 0, 10, height);
    }
  },
  dots: (ctx, width, height) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    for (let x = 10; x < width; x += 20) {
      for (let y = 10; y < height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  checkers: (ctx, width, height) => {
    const size = 20;
    for (let x = 0; x < width; x += size) {
      for (let y = 0; y < height; y += size) {
        ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(x, y, size, size);
      }
    }
  }
};

Object.keys(patterns).forEach(name => {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  patterns[name](ctx, 256, 256);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${name}.png`, buffer);
});
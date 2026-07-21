// Confetti animation - creates colorful falling particles when you win
export function triggerConfetti() {
  const colors = ["#00c6ff","#00e676","#f0b429","#ff3d57","#a78bfa","#fff"];
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 6;
    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const duration = Math.random() * 2 + 2;
    const rotation = Math.random() * 360;
    const shape = Math.random() > 0.5 ? "50%" : "0";
    piece.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:${color};left:${left}%;top:-20px;border-radius:${shape};animation:confettiFall ${duration}s ${delay}s ease-in forwards;transform:rotate(${rotation}deg);`;
    container.appendChild(piece);
  }
  setTimeout(() => document.body.removeChild(container), 4000);
}

// Confetti setup
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let confetti = [];

function randomConfettiPiece() {
  const shapes = ["square", "circle", "heart", "semi"];
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * -20,
    r: Math.random() * 6 + 4,
    d: Math.random() * 5 + 2,
    color: ["red", "blue", "white", "yellow"][Math.floor(Math.random() * 4)],
    shape: shapes[Math.floor(Math.random() * shapes.length)]
  };
}

function drawConfettiPiece(p) {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  if (p.shape === "circle") ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
  else if (p.shape === "square") ctx.fillRect(p.x, p.y, p.r, p.r);
  else if (p.shape === "heart") {
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x - p.r/2, p.y, p.r/2, 0, Math.PI);
    ctx.arc(p.x + p.r/2, p.y, p.r/2, 0, Math.PI);
    ctx.lineTo(p.x, p.y + p.r);
  } else if (p.shape === "semi") ctx.arc(p.x, p.y, p.r, 0, Math.PI);
  ctx.fill();
}

function renderConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confetti.forEach((p, i) => {
    p.y += p.d;
    drawConfettiPiece(p);
    if (p.y > canvas.height) confetti[i] = randomConfettiPiece();
  });
  requestAnimationFrame(renderConfetti);
}

// Popup
function showPopup() {
  document.getElementById("popup").classList.add("show");
}

// Mic Detection
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const mic = audioContext.createMediaStreamSource(stream);
  mic.connect(analyser);

  const dataArray = new Uint8Array(analyser.fftSize);
  function detectBlow() {
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      let sample = (dataArray[i] - 128) / 128;
      sum += sample * sample;
    }
    let volume = Math.sqrt(sum / dataArray.length);
    if (volume > 0.05) { // sensitif
      document.querySelectorAll(".flame").forEach(f => f.style.display = "none");
      for (let i = 0; i < 150; i++) confetti.push(randomConfettiPiece());
      renderConfetti();
      showPopup();
    }
    requestAnimationFrame(detectBlow);
  }
  detectBlow();
});
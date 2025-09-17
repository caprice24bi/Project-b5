// script.js - single-candle cake with mic detection, confetti from left & right, popup
const confettiCanvas = document.getElementById('confetti');
const cctx = confettiCanvas.getContext('2d');
function resizeCanvas(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);

let pieces = [];

// create confetti piece starting from left or right
function createPiece(side){
  const size = Math.random()*12 + 6;
  const y = Math.random()* (confettiCanvas.height*0.6);
  const speedY = Math.random()*2 + 2;
  const vx = side === 'left' ? (Math.random()*2 + 1) : -(Math.random()*2 + 1);
  const x = side === 'left' ? -20 : confettiCanvas.width + 20;
  const color = ['#ff2d55','#0a84ff','#ffffff','#ffd60a'][Math.floor(Math.random()*4)];
  const shape = ['heart','square','circle','semicircle'][Math.floor(Math.random()*4)];
  pieces.push({x,y,vx,vy:speedY,size,color,shape,rot:Math.random()*6});
}

function drawPiece(p){
  cctx.save();
  cctx.translate(p.x,p.y);
  cctx.rotate(p.rot);
  cctx.fillStyle = p.color;
  if(p.shape==='circle') cctx.beginPath(), cctx.arc(0,0,p.size/2,0,Math.PI*2), cctx.fill();
  else if(p.shape==='square') cctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
  else if(p.shape==='heart'){ // simple heart
    cctx.beginPath();
    cctx.moveTo(0,-p.size/4);
    cctx.bezierCurveTo(-p.size/2,-p.size/2,-p.size,-p.size/5,0,p.size/2);
    cctx.bezierCurveTo(p.size,-p.size/5,p.size/2,-p.size/2,0,-p.size/4);
    cctx.fill();
  } else if(p.shape==='semicircle'){
    cctx.beginPath(); cctx.arc(0,0,p.size/2,Math.PI,2*Math.PI); cctx.fill();
  }
  cctx.restore();
}

function updateAndDraw(){
  cctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  for(let i=pieces.length-1;i>=0;i--){
    const p = pieces[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rot += 0.05;
    if(p.y > confettiCanvas.height + 40 || p.x < -80 || p.x > confettiCanvas.width + 80) pieces.splice(i,1);
    else drawPiece(p);
  }
  requestAnimationFrame(updateAndDraw);
}
updateAndDraw();

// popup
const popup = document.getElementById('popup');
function showPopup(){
  popup.classList.add('show');
  popup.querySelector('.popup-card')?.classList.add('show');
  popup.classList.add('show');
  popup.style.pointerEvents = 'auto';
}

// mic detection - super sensitive using RMS
function startMic(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    function detect(){
      analyser.getByteTimeDomainData(data);
      let sum=0;
      for(let i=0;i<data.length;i++){
        const v = (data[i]-128)/128;
        sum += v*v;
      }
      const rms = Math.sqrt(sum / data.length);
      // very sensitive threshold: trigger on small puffs
      if(rms > 0.02 && !document.querySelector('.candle').classList.contains('out')){
        // extinguish candle (add out class)
        document.querySelector('.candle').classList.add('out');
        // launch confetti from both sides
        for(let i=0;i<180;i++){
          createPiece(i%2? 'left':'right');
        }
        showPopup();
      }
      requestAnimationFrame(detect);
    }
    detect();
  }).catch(e=>{
    console.log('mic error', e);
    // fallback: allow click on candle to extinguish
  });
}

// fallback click to extinguish and trigger confetti
document.querySelector('.candle').addEventListener('click', ()=>{
  if(!document.querySelector('.candle').classList.contains('out')){
    document.querySelector('.candle').classList.add('out');
    for(let i=0;i<120;i++){ createPiece(i%2? 'left':'right'); }
    showPopup();
  }
});

// init mic on first user interaction to satisfy browser autoplay policies
window.addEventListener('click', function init(){ startMic(); window.removeEventListener('click', init); }, {once:true});
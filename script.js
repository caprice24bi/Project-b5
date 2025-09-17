document.addEventListener('DOMContentLoaded', () => {
    const flame = document.getElementById('flame');
    const popupOverlay = document.getElementById('popup-overlay');
    const confettiContainer = document.getElementById('confetti-container');
    
    // Check for browser support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request microphone access
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(stream);
                const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
                
                microphone.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                // Set a lower threshold for "super sensitive" detection
                const threshold = 120; 
                let isBlowing = false;

                scriptProcessor.onaudioprocess = () => {
                    analyser.getByteFrequencyData(dataArray);
                    
                    // Find the average volume
                    let sum = dataArray.reduce((acc, val) => acc + val, 0);
                    let average = sum / bufferLength;

                    // Detect "blowing" sound
                    if (average > threshold && !isBlowing) {
                        isBlowing = true;
                        extinguishCandle();
                    }
                };

            })
            .catch(err => {
                console.error("Error accessing microphone: ", err);
                alert("Maaf, tidak bisa mengakses mikrofon. Lilin tidak bisa ditiup.");
            });
    } else {
        alert("Browser Anda tidak mendukung Web Audio API.");
    }

    function extinguishCandle() {
        if (!flame.classList.contains('extinguished')) {
            flame.style.display = 'none';
            flame.classList.add('extinguished');
            
            setTimeout(() => {
                // Show confetti
                confettiContainer.style.display = 'block';
                createConfetti();
                
                // Show popup
                popupOverlay.style.display = 'flex';
            }, 500); // Wait a moment for effect
        }
    }

    function createConfetti() {
        const colors = ['#e91e63', '#9c27b0', '#ffeb3b', '#2196f3'];
        const confettiCount = 100;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            confettiContainer.appendChild(confetti);
        }
    }

    // Close pop-up when clicked
    popupOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'popup-overlay' || e.target.classList.contains('popup-close')) {
            popupOverlay.style.display = 'none';
        }
    });
});

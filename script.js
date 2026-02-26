const viewKeypad = document.getElementById('view-keypad');
const viewBuzzer = document.getElementById('view-buzzer');
const pinDisplay = document.getElementById('pin-display');
const keys = document.querySelectorAll('.key');
const submitBtn = document.getElementById('submit-btn');
const buzzerBtn = document.getElementById('buzzer-btn');

let currentPin = '';

// --- KEYPAD ---
keys.forEach(key => {
    key.addEventListener('click', () => {
        const value = key.dataset.value;
        if (key.id === 'clear-btn') {
            currentPin = '';
        } else if (key.id === 'submit-btn') {
            transitionToBuzzer();
            return;
        } else {
            if (currentPin.length < 4) currentPin += value;
        }
        updateDisplay();
    });
});

function updateDisplay() {
    pinDisplay.value = '•'.repeat(currentPin.length);
    submitBtn.disabled = currentPin.length !== 4;
}

function transitionToBuzzer() {
    // Instant swap: No waiting for Netlify = No squish.
    viewKeypad.style.display = 'none';
    viewBuzzer.style.display = 'flex';
    viewBuzzer.classList.add('active');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
}

// --- BUZZER ACTION ---
buzzerBtn.addEventListener('click', async () => {
    if (buzzerBtn.classList.contains('active')) return;

    // 1. Instant feedback
    buzzerBtn.querySelector('span').innerText = '...';
    
    // 2. 1-second delay to simulate hardware/real-life
    setTimeout(() => {
        // Start the buzz state
        buzzerBtn.classList.add('active');
        buzzerBtn.querySelector('span').innerText = 'BUZZING';
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        // 3. Trigger backend in the background (Optimistic)
        fetch(`/.netlify/functions/toggle?pin=${currentPin}`).catch(() => {});

        // 4. Self-reset after 4 seconds
        setTimeout(() => {
            resetToKeypad();
        }, 4000);
    }, 1000);
});

function resetToKeypad() {
    currentPin = '';
    updateDisplay();
    buzzerBtn.classList.remove('active');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
    
    // Smooth reset
    viewBuzzer.style.display = 'none';
    viewKeypad.style.display = 'flex';
    viewKeypad.classList.add('active');
}

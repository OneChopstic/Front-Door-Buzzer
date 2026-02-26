const viewKeypad = document.getElementById('view-keypad');
const viewBuzzer = document.getElementById('view-buzzer');
const pinDisplay = document.getElementById('pin-display');
const keys = document.querySelectorAll('.key');
const submitBtn = document.getElementById('submit-btn');
const keypadContainer = document.querySelector('.keypad-container');
const buzzerBtn = document.getElementById('buzzer-btn');

let currentPin = '';

// --- KEYPAD ---
keys.forEach(key => {
    key.addEventListener('click', () => {
        const value = key.dataset.value;
        if (key.id === 'clear-btn') {
            currentPin = '';
        } else if (key.id === 'submit-btn') {
            checkPinWithServer();
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

async function checkPinWithServer() {
    submitBtn.innerText = '...';
    try {
        // Fast ping to Netlify to verify PIN without triggering hardware
        const response = await fetch(`/.netlify/functions/toggle?pin=${currentPin}&checkOnly=true`);
        
        if (response.ok) {
            transitionToBuzzer();
        } else {
            // Wrong PIN: SHAKE
            keypadContainer.classList.add('shake');
            setTimeout(() => {
                keypadContainer.classList.remove('shake');
                currentPin = '';
                updateDisplay();
            }, 500);
        }
    } catch (e) {
        alert("Offline");
    } finally {
        submitBtn.innerText = '→';
    }
}

function transitionToBuzzer() {
    viewKeypad.style.display = 'none';
    viewBuzzer.style.display = 'flex';
    viewBuzzer.classList.add('active');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
}

// --- BUZZER ACTION ---
buzzerBtn.addEventListener('click', async () => {
    if (buzzerBtn.classList.contains('active')) return;

    buzzerBtn.querySelector('span').innerText = '...';
    
    // 2-second real-life delay
    setTimeout(() => {
        buzzerBtn.classList.add('active');
        buzzerBtn.querySelector('span').innerText = 'BUZZING';
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        // Actual trigger
        fetch(`/.netlify/functions/toggle?pin=${currentPin}`).catch(() => {});

        // Visible for 4 sec then reset
        setTimeout(() => {
            resetToKeypad();
        }, 4000);
    }, 2000); 
});

function resetToKeypad() {
    currentPin = '';
    updateDisplay();
    buzzerBtn.classList.remove('active');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
    
    viewBuzzer.style.display = 'none';
    viewKeypad.style.display = 'flex';
    viewKeypad.classList.add('active');
}

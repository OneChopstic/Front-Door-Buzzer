const viewKeypad = document.getElementById('view-keypad');
const viewBuzzer = document.getElementById('view-buzzer');
const pinDisplay = document.getElementById('pin-display');
const keys = document.querySelectorAll('.key');
const submitBtn = document.getElementById('submit-btn');
const keypadContainer = document.querySelector('.keypad-container');
const buzzerBtn = document.getElementById('buzzer-btn');

let currentPin = '';
const CORRECT_PIN = '1945'; // Client-side check for UI flow

// --- KEYPAD LOGIC ---
keys.forEach(key => {
    key.addEventListener('click', () => {
        const value = key.dataset.value;

        if (key.id === 'clear-btn') {
            currentPin = '';
        } else if (key.id === 'submit-btn') {
            verifyPin();
            return;
        } else {
            if (currentPin.length < 4) {
                currentPin += value;
            }
        }
        updateDisplay();
    });
});

function updateDisplay() {
    pinDisplay.value = '•'.repeat(currentPin.length);
    if (currentPin.length === 4) {
        submitBtn.disabled = false;
        // Optional: Auto-submit? Let's stick to arrow button for clarity
    } else {
        submitBtn.disabled = true;
    }
}

function verifyPin() {
    // 1. Check PIN (Client-side fast check)
    if (currentPin === CORRECT_PIN) {
        // Success: Transition to Buzzer
        transitionToBuzzer();
    } else {
        // Error: Shake
        keypadContainer.classList.add('shake');
        setTimeout(() => keypadContainer.classList.remove('shake'), 500);
        currentPin = '';
        updateDisplay();
    }
}

function transitionToBuzzer() {
    viewKeypad.classList.remove('active');

    // Slight delay for smooth fade
    setTimeout(() => {
        viewBuzzer.classList.add('active');
    }, 500);
}

// --- BUZZER LOGIC ---
buzzerBtn.addEventListener('click', async () => {
    if (buzzerBtn.classList.contains('loading') || buzzerBtn.classList.contains('active')) return;

    // 1. UI Loading
    buzzerBtn.classList.add('loading');
    buzzerBtn.querySelector('span').innerText = '...';

    try {
        // 2. Call API (Server-side security check)
        const response = await fetch(window.location.origin + '/.netlify/functions/toggle?pin=' + currentPin);

        if (response.ok) {
            triggerSuccess();
        } else {
            // Unexpected Error (e.g. server down or PIN changed on backend)
            alert("Connection Error");
            resetToKeypad();
        }
    } catch (error) {
        console.error(error);
        alert("Network Error");
        resetToKeypad();
    }
});

function triggerSuccess() {
    buzzerBtn.classList.remove('loading');
    buzzerBtn.classList.add('active');
    buzzerBtn.querySelector('span').innerText = 'OPENING';

    if (navigator.vibrate) navigator.vibrate([200]);

    // Reset after 4 seconds
    setTimeout(() => {
        buzzerBtn.classList.remove('active');
        buzzerBtn.querySelector('span').innerHTML = 'OPEN<br>DOOR';

        // Optional: Do we stay here or go back to PIN?
        // User didn't specify, but staying here makes it easy to open again.
        // If security is key, we should go back. Let's stay for convenience for now.
    }, 4000);
}

function resetToKeypad() {
    buzzerBtn.classList.remove('loading');
    buzzerBtn.querySelector('span').innerHTML = 'OPEN<br>DOOR';
    viewBuzzer.classList.remove('active');
    setTimeout(() => {
        currentPin = '';
        updateDisplay();
        viewKeypad.classList.add('active');
    }, 500);
}

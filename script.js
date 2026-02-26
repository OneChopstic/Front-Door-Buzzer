const viewKeypad = document.getElementById('view-keypad');
const viewBuzzer = document.getElementById('view-buzzer');
const pinDisplay = document.getElementById('pin-display');
const keys = document.querySelectorAll('.key');
const submitBtn = document.getElementById('submit-btn');
const keypadContainer = document.querySelector('.keypad-container');
const buzzerBtn = document.getElementById('buzzer-btn');

let currentPin = '';

// --- KEYPAD LOGIC ---
keys.forEach(key => {
    key.addEventListener('click', () => {
        const value = key.dataset.value;

        if (key.id === 'clear-btn') {
            currentPin = '';
        } else if (key.id === 'submit-btn') {
            // Direct transition: Server will handle the actual PIN check
            transitionToBuzzer();
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
    submitBtn.disabled = currentPin.length !== 4;
}

function transitionToBuzzer() {
    viewKeypad.classList.remove('active');
    setTimeout(() => {
        viewKeypad.style.display = 'none';
        viewBuzzer.style.display = 'flex';
        setTimeout(() => viewBuzzer.classList.add('active'), 10);
    }, 500);
}

// --- TRIGGER LOGIC ---
buzzerBtn.addEventListener('click', async () => {
    if (buzzerBtn.classList.contains('loading') || buzzerBtn.classList.contains('active')) return;

    buzzerBtn.classList.add('loading');
    buzzerBtn.querySelector('span').innerText = 'WAIT...';

    try {
        // Send the PIN to your Netlify function
        const response = await fetch(`/.netlify/functions/toggle?pin=${currentPin}`);

        if (response.ok) {
            triggerSuccess();
        } else {
            // If server returns 401 (Wrong PIN) or other error
            alert("Access Denied");
            resetToKeypad();
        }
    } catch (error) {
        alert("Connection Error");
        resetToKeypad();
    }
});

function triggerSuccess() {
    buzzerBtn.classList.remove('loading');
    buzzerBtn.classList.add('active');
    buzzerBtn.querySelector('span').innerText = 'OPENING';
    
    if (navigator.vibrate) navigator.vibrate([200]);

    // Hold "OPENING" state for 6 seconds then auto-reset
    setTimeout(() => {
        resetToKeypad();
    }, 6000);
}

function resetToKeypad() {
    currentPin = '';
    updateDisplay();
    buzzerBtn.classList.remove('loading', 'active');
    buzzerBtn.querySelector('span').innerHTML = 'OPEN<br>DOOR';
    viewBuzzer.classList.remove('active');
    
    setTimeout(() => {
        viewBuzzer.style.display = 'none';
        viewKeypad.style.display = 'flex';
        setTimeout(() => viewKeypad.classList.add('active'), 10);
    }, 500);
}

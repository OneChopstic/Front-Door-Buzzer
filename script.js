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

// --- SECURITY CHECK ---
// This talks to Netlify to see if the PIN is right without showing the PIN here.
async function checkPinWithServer() {
    submitBtn.innerText = '...';
    try {
        const response = await fetch(`/.netlify/functions/toggle?pin=${currentPin}&checkOnly=true`);
        if (response.ok) {
            transitionToBuzzer();
        } else {
            // Wrong PIN: SHAKE the container
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
    setTimeout(() => {
        viewBuzzer.classList.add('active');
        buzzerBtn.querySelector('span').innerText = 'OPEN';
    }, 10);
}

// --- BUZZER ACTION ---
buzzerBtn.addEventListener('click', async () => {
    if (buzzerBtn.classList.contains('active')) return;

    // 1. Initial Press: show the three dots
    buzzerBtn.querySelector('span').innerText = '...';
    
    // 2. Real-life delay (2 Seconds) to wait for the cloud signal
    setTimeout(() => {
        // Trigger the actual hardware via Netlify
        fetch(`/.netlify/functions/toggle?pin=${currentPin}`).catch(() => {});

        // 3. 0.5s Hardware Offset: Wait for the relay to actually click
        setTimeout(() => {
            // Add the 'buzzer-vibrate' class for the up/down shake
            buzzerBtn.classList.add('active', 'buzzer-vibrate');
            buzzerBtn.querySelector('span').innerText = 'BUZZING';
            
            // Haptic feedback for the phone
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);

            // 4. Stay active for 5.5s total to cover the 4s buzz + the start-up lag
            setTimeout(() => {
                resetToKeypad();
            }, 5500); 
        }, 500); 

    }, 2000); 
});

// --- RESET LOGIC ---
// Clears everything and goes back to the PIN screen
function resetToKeypad() {
    currentPin = '';
    updateDisplay();
    buzzerBtn.classList.remove('active', 'buzzer-vibrate');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
    
    viewBuzzer.style.display = 'none';
    viewKeypad.style.display = 'flex';
    viewKeypad.classList.add('active');
}    buzzerBtn.classList.remove('active');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
    
    viewBuzzer.style.display = 'none';
    viewKeypad.style.display = 'flex';
    viewKeypad.classList.add('active');
}

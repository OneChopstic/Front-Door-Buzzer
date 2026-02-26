// 1. Grab all elements from the HTML
const viewKeypad = document.getElementById('view-keypad');
const viewBuzzer = document.getElementById('view-buzzer');
const pinDisplay = document.getElementById('pin-display');
const keys = document.querySelectorAll('.key'); // All number buttons
const submitBtn = document.getElementById('submit-btn'); // The arrow button
const keypadContainer = document.querySelector('.keypad-container');
const buzzerBtn = document.getElementById('buzzer-btn'); // The big circle

let currentPin = '';

// --- KEYPAD LOGIC ---
// This part makes the numbers appear when you click them
keys.forEach(key => {
    key.addEventListener('click', () => {
        const value = key.dataset.value;
        
        if (key.id === 'clear-btn') {
            currentPin = ''; // Reset the PIN
        } else if (key.id === 'submit-btn') {
            checkPinWithServer(); // Verify the PIN
            return;
        } else {
            // Only allow up to 4 digits
            if (currentPin.length < 4) {
                currentPin += value;
            }
        }
        updateDisplay();
    });
});

// Update the "dots" in the input field
function updateDisplay() {
    pinDisplay.value = '•'.repeat(currentPin.length);
    // Only enable the arrow if 4 digits are typed
    submitBtn.disabled = currentPin.length !== 4;
}

// --- SECURITY CHECK ---
// This talks to Netlify to see if the PIN is right
async function checkPinWithServer() {
    submitBtn.innerText = '...'; // Show it's working
    try {
        // Ping Netlify without triggering the door
        const response = await fetch(`/.netlify/functions/toggle?pin=${currentPin}&checkOnly=true`);
        
        if (response.ok) {
            transitionToBuzzer();
        } else {
            // WRONG PIN: Trigger the left-right shake
            keypadContainer.classList.add('shake');
            setTimeout(() => {
                keypadContainer.classList.remove('shake');
                currentPin = '';
                updateDisplay();
            }, 500);
        }
    } catch (e) {
        alert("Connection Error");
    } finally {
        submitBtn.innerText = '→';
    }
}

// Swap from Keypad to the Big Button
function transitionToBuzzer() {
    viewKeypad.style.display = 'none';
    viewBuzzer.style.display = 'flex';
    setTimeout(() => {
        viewBuzzer.classList.add('active');
        buzzerBtn.querySelector('span').innerText = 'OPEN';
    }, 10);
}

// --- BUZZER ACTION ---
// This handles the 2s wait, the 0.5s hardware offset, and the 5.5s reset
buzzerBtn.addEventListener('click', async () => {
    if (buzzerBtn.classList.contains('active')) return;

    // 1. Show the wait state
    buzzerBtn.querySelector('span').innerText = '...';
    
    // 2. The 2-second real-life delay
    setTimeout(() => {
        // Trigger the actual hardware signal
        fetch(`/.netlify/functions/toggle?pin=${currentPin}`).catch(() => {});

        // 3. The 0.5s offset to sync with the hardware clicking
        setTimeout(() => {
            // Start the vertical vibrate and red color
            buzzerBtn.classList.add('active', 'buzzer-vibrate');
            buzzerBtn.querySelector('span').innerText = 'BUZZING';
            
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);

            // 4. Stay active for 5.5 seconds total
            setTimeout(() => {
                resetToKeypad();
            }, 5500); 
        }, 500); 

    }, 2000); 
});

// Reset back to the PIN screen
function resetToKeypad() {
    currentPin = '';
    updateDisplay();
    buzzerBtn.classList.remove('active', 'buzzer-vibrate');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
    
    viewBuzzer.style.display = 'none';
    viewKeypad.style.display = 'flex';
    viewKeypad.classList.add('active');
}}

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

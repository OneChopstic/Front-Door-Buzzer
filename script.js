// 1. Grab all elements from the HTML
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

// --- SECURITY CHECK ---
async function checkPinWithServer() {
    submitBtn.innerText = '...'; 
    try {
        const response = await fetch(`/.netlify/functions/toggle?pin=${currentPin}&checkOnly=true`);
        
        if (response.ok) {
            transitionToBuzzer();
        } else {
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

    buzzerBtn.querySelector('span').innerText = '...';
    
    // 2-second real-life delay
    setTimeout(() => {
        // Trigger hardware
        fetch(`/.netlify/functions/toggle?pin=${currentPin}`).catch(() => {});

        // 0.5s Hardware Offset
        setTimeout(() => {
            buzzerBtn.classList.add('active', 'buzzer-vibrate');
            buzzerBtn.querySelector('span').innerText = 'BUZZING';
            
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);

            // Reset after 5.5 seconds total
            setTimeout(() => {
                resetToKeypad();
            }, 5500); 
        }, 500); 

    }, 2000); 
});

// --- RESET LOGIC ---
function resetToKeypad() {
    currentPin = '';
    updateDisplay();
    buzzerBtn.classList.remove('active', 'buzzer-vibrate');
    buzzerBtn.querySelector('span').innerText = 'OPEN';
    
    viewBuzzer.style.display = 'none';
    viewKeypad.style.display = 'flex';
    viewKeypad.classList.add('active');
}

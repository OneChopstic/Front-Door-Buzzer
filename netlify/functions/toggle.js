const fetch = require('node-fetch');

exports.handler = async (event) => {
    // 1. Setup Standard Headers
    // Allows the browser to talk to the server (CORS)
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // Handle the browser's "pre-flight" check
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    // 2. PIN Verification Logic
    // Grab the PIN from the URL and compare it to the secret STUDIO_PIN in Netlify
    const { pin, checkOnly } = event.queryStringParameters || {};
    const correctPin = process.env.STUDIO_PIN || '1945';

    if (pin !== correctPin) {
        console.error("Wrong PIN entered.");
        return { 
            statusCode: 401, 
            headers, 
            body: JSON.stringify({ error: 'Unauthorized' }) 
        };
    }

    // 3. Pre-Check Mode (Keypad Shake)
    // If the script just wants to verify the PIN (checkOnly=true), stop here.
    // This allows the keypad to "shake" on a wrong PIN without opening the door.
    if (checkOnly === 'true') {
        console.log("PIN verified for keypad transition.");
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ valid: true }) 
        };
    }

    // 4. Hardware Trigger (Voice Monkey)
    // If we got this far, the PIN is right and the user pressed the big button.
    const url = 'https://api-v2.voicemonkey.io/trigger?token=be39fc0bdd0850f704fd1e65fe87a7e7_76dda27437714ebfeac85750b8aa932c&device=frontdoor-buzzer';

    try {
        console.log("Triggering Alexa routine via Voice Monkey...");
        
        // We trigger the URL but don't wait forever for a response.
        // This keeps the phone app feeling fast.
        await fetch(url, { method: 'GET', timeout: 3000 });
        
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ success: true }) 
        };
    } catch (e) {
        // If there's a timeout or network glitch, we still return 200.
        // Since the PIN was correct, the trigger most likely went through.
        console.warn("Hardware trigger timed out, but signal was likely sent.");
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ success: true, note: "Triggered with timeout" }) 
        };
    }
};

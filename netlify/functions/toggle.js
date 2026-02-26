const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Standard headers for Netlify functions
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // Handle the browser's "pre-check" (OPTIONS)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    // 1. PIN Verification
    const { pin } = event.queryStringParameters || {};
    const correctPin = process.env.STUDIO_PIN || '1945';

    if (pin !== correctPin) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    // 2. Voice Monkey (Alexa Bridge) Trigger URL
    const url = 'https://api-v2.voicemonkey.io/trigger?token=be39fc0bdd0850f704fd1e65fe87a7e7_76dda27437714ebfeac85750b8aa932c&device=frontdoor-buzzer';

    try {
        console.log("Triggering Alexa routine via Voice Monkey...");
        const apiResponse = await fetch(url, {
            method: 'GET', // Voice Monkey triggers use GET
            timeout: 5000
        });

        const data = await apiResponse.json();

        if (apiResponse.ok && data.status === "success") {
            console.log("SUCCESS: Voice Monkey triggered Alexa.");
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            console.error(`ERROR: Voice Monkey returned error: ${data.msg || apiResponse.status}`);
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Upstream Error', message: data.msg })
            };
        }
    } catch (error) {
        console.error("CRITICAL ERROR: Failed to reach Voice Monkey.", error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server Error', message: error.message })
        };
    }
};

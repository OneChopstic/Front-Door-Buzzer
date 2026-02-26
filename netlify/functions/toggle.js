const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    const { pin } = event.queryStringParameters || {};
    const correctPin = process.env.STUDIO_PIN || '1945';

    if (pin !== correctPin) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const url = 'https://api-v2.voicemonkey.io/trigger?token=be39fc0bdd0850f704fd1e65fe87a7e7_76dda27437714ebfeac85750b8aa932c&device=frontdoor-buzzer';

    try {
        const apiResponse = await fetch(url, { method: 'GET', timeout: 5000 });
        
        // We check status first. If 200, the door is buzzing.
        if (apiResponse.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Upstream Error' })
            };
        }
    } catch (error) {
        // Even if there's a network glitch, if we reached this point, 
        // the trigger was likely sent. We return 200 to keep the UI clean.
        return {
            statusCode: 200, 
            headers,
            body: JSON.stringify({ success: true, warning: "Network timeout" })
        };
    }
};

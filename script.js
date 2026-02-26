const fetch = require('node-fetch');

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    const { pin, checkOnly } = event.queryStringParameters || {};
    const correctPin = process.env.STUDIO_PIN || '1945';

    if (pin !== correctPin) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // If we just want to check if the PIN is right, stop here.
    if (checkOnly === 'true') {
        return { statusCode: 200, headers, body: JSON.stringify({ valid: true }) };
    }

    const url = 'https://api-v2.voicemonkey.io/trigger?token=be39fc0bdd0850f704fd1e65fe87a7e7_76dda27437714ebfeac85750b8aa932c&device=frontdoor-buzzer';

    try {
        await fetch(url, { method: 'GET', timeout: 3000 });
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, note: "Timeout" }) };
    }
};

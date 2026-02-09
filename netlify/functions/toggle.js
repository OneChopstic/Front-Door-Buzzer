const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Add these headers to stop the "Connection Error" in the browser
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

    const { pin } = event.queryStringParameters || {};
    const correctPin = process.env.STUDIO_PIN || '1945';

    if (pin !== correctPin) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const url = 'https://eovtmke4vdwcgwi.m.pipedream.net';

    try {
        console.log("Attempting to buzz Berlin door via Pipedream...");
        const apiResponse = await fetch(url, {
            method: 'POST',
            timeout: 5000
        });

        if (apiResponse.ok) {
            console.log("SUCCESS: Pipedream triggered successfully.");
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            // This is the bug report for the server side
            console.error(`ERROR: Pipedream returned status ${apiResponse.status}`);
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Upstream Error', code: apiResponse.status })
            };
        }
    } catch (error) {
        console.error("CRITICAL ERROR: Failed to reach Pipedream.", error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server Error', message: error.message })
        };
    }
};

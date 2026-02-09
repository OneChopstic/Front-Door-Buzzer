# Front Door Buzzer

A secure, web-based controller for your Sonoff switch, running on **Netlify** and connecting via Pipedream.

## 🚀 Deployment Instructions

1.  **Push to Netlify**:
    *   Drag and drop this "Front Door Buzzer" folder onto the Netlify dashboard (or connect via Git).

2.  **Environment Variables** (Optional):
    *   Go to **Site configuration > Environment variables**.
    *   Add `STUDIO_PIN` if you want to change the default PIN (1945).

    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `STUDIO_PIN` | `1945` | The 4-digit PIN code to unlock the buzzer. Defaults to `1945` if not set. |

## ⚙️ Pipedream Setup

The button triggers the following verified URL:
`https://eovtmke4vdwcgwi.m.pipedream.net`

## 🛠️ Testing Locally

To test the API locally, you need the Netlify CLI:

```bash
npm i -g netlify-cli
netlify dev
```

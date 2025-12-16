# MMM-GeminiWallpaper

A module for [MagicMirror²](https://magicmirror.builders/) that automatically generates unique, photorealistic sports-themed wallpapers using Google Gemini AI (Model 2.5 Flash Image).

The module intelligently selects a sport or team based on your preferences and generates a high-resolution (4K) image suitable for a smart mirror display.

## Features

*   **AI Generated**: Uses Google Gemini to create unique images for every update.
*   **Content Customization**: Prioritize your favorite teams or specific leagues (NHL, NBA, etc.).
*   **Prompt Injection**: Add custom context or style instructions to the AI generation process.
*   **Visual Modes**: 
    *   Supports Black & White (ideal for mirror contrast) or Color.
    *   Opacity and Blur control to ensure legibility of other modules.
*   **Formats**: Supports Landscape and Portrait orientations.

## Installation

1.  Clone this repository into your `modules` folder:
    ```bash
    cd ~/MagicMirror/modules
    git clone https://github.com/vigc0/MMM-GeminiWallpaper.git
    ```
2.  Obtain a free Google Gemini API Key at [Google AI Studio](https://aistudio.google.com/).

## Configuration

Add the following configuration to your `config/config.js` file:

```javascript
{
    module: "MMM-GeminiWallpaper",
    position: "fullscreen_below", // Important: places module in background
    config: {
        apiKey: "YOUR_GEMINI_API_KEY", // Required
        
        // --- Appearance ---
        opacity: 0.5,           // Image opacity (0.0 to 1.0)
        color: false,           // false = Black & White (recommended), true = Color
        blur: 2,                // Blur level: 0 (None), 2 (Low), 5 (Medium), 10 (High)
        
        // --- Format ---
        aspectRatio: "16:9",    // "16:9" or "4:3"
        orientation: "landscape", // "landscape" or "portrait"
        
        // --- Content (Module will pick one option from these lists) ---
        teams: ["Montreal Canadiens", "PSG", "Ferrari F1"], 
        leagues: ["NHL", "NBA", "Champions League"],
        promptInjection: "", // Optional: "Vintage style", "Cyberpunk", etc.
        
        updateInterval: 14400000 // Update every 4 hours (in ms)
    }
}
```

## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | String | "" | **Required**. Your Google Gemini API Key. |
| `model` | String | "gemini-2.5-flash-image" | The Gemini model to use. [See available models here](https://ai.google.dev/gemini-api/docs/models/gemini). |
| `updateInterval` | Integer | 14400000 | Time between updates (ms). Default: 4h. |
| `opacity` | Float | 0.5 | Background opacity (0 to 1). |
| `color` | Boolean | false | If `true`, image is generated in color. If `false`, in "Noir" black and white. |
| `blur` | Integer | 0 | Applies a Gaussian blur to the image. Levels: 0 (None), 2 (Low), 5 (Medium), 10 (High). Max: 10px. |
| `orientation` | String | "landscape" | "landscape" or "portrait". Adjusts the generation prompt. |
| `teams` | Array | [] | List of favorite teams. The module picks one at random. |
| `leagues` | Array | [] | List of leagues (used if no specific team is selected). |
| `promptInjection` | String | "" | Custom text appended to the prompt for additional context or styling (e.g., "Add a futuristic neon vibe"). |

## Credits

Developed for MagicMirror². Powered by Google Gemini API.

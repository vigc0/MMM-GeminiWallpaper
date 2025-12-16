/* Magic Mirror
 * Module: MMM-GeminiWallpaper
 *
 * Description: Generates a daily sports-themed wallpaper using Google Gemini 2.5 Flash Image.
 *
 * Config options:
 *   apiKey: Your Google Gemini API Key.
 *   updateInterval: Milliseconds between updates (default 4 hours).
 *   opacity: Opacity of the background image (0.1 - 1.0).
 *   leagues: Array of strings (e.g. ["NHL", "NBA", "Premier League"]).
 *   teams: Array of strings (e.g. ["Montreal Canadiens", "PSG"]).
 *   aspectRatio: String (e.g. "16:9", "4:3").
 *   orientation: String ("landscape" or "portrait").
 *   color: Boolean (true for color, false for B&W).
 *   blur: Integer (Pixels of blur to apply, 0 (None), 2 (Low), 5 (Medium), 10 (High)). Max 10.
 *   promptInjection: String (Custom instruction appended to context generation).
 */

Module.register("MMM-GeminiWallpaper", {
    defaults: {
        apiKey: "", // REQUIRED
        model: "gemini-2.5-flash-image",
        updateInterval: 4 * 60 * 60 * 1000, // Every 4 hours
        opacity: 0.5,
        
        // Visual Options
        color: false, // False = Black & White, True = Color
        blur: 0, // Blur pixels
        aspectRatio: "16:9",
        orientation: "landscape",
        
        // Content Preferences
        leagues: [], 
        teams: [],
        promptInjection: "" // New feature: allows custom prompt additions
    },

    getStyles: function() {
        return ["MMM-GeminiWallpaper.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        this.imageUrl = null;
        this.debugText = null; // Store debug text
        this.loaded = false;

        if (this.config.apiKey === "") {
            Log.error("MMM-GeminiWallpaper: API Key is missing!");
            return;
        }

        this.updateWallpaper();
        
        // Schedule updates
        setInterval(() => {
            this.updateWallpaper();
        }, this.config.updateInterval);
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "gemini-wallpaper-wrapper";
        wrapper.style.opacity = this.config.opacity;
        
        if (this.imageUrl) {
            var img = document.createElement("img");
            img.src = this.imageUrl;
            img.className = "gemini-wallpaper-image fade-in";
            
            // Construct Filter String
            let filterString = "";
            
            // Color Logic
            if (!this.config.color) {
                // Default B&W filter
                filterString += "grayscale(100%) brightness(0.6) contrast(1.1) ";
            } else {
                // Color mode
                filterString += "brightness(0.7) ";
            }

            // Blur Logic
            let blur = parseInt(this.config.blur) || 0;
            // Strict enforcement of 10px limit as per requirements
            if (blur > 10) blur = 10;
            if (blur < 0) blur = 0;

            if (blur > 0) {
                filterString += `blur(${blur}px) `;
            }
            
            img.style.filter = filterString.trim();
            wrapper.appendChild(img);
        }

        // Temporary Debug Display
        if (this.debugText) {
            var debugBox = document.createElement("div");
            debugBox.style.position = "absolute";
            debugBox.style.bottom = "20px";
            debugBox.style.left = "20px";
            debugBox.style.right = "20px";
            debugBox.style.color = "lime";
            debugBox.style.backgroundColor = "rgba(0,0,0,0.8)";
            debugBox.style.padding = "10px";
            debugBox.style.fontFamily = "monospace";
            debugBox.style.fontSize = "12px";
            debugBox.style.zIndex = "9999";
            debugBox.style.pointerEvents = "auto";
            debugBox.innerText = "DEBUG PROMPT: " + this.debugText;
            wrapper.appendChild(debugBox);
        }

        return wrapper;
    },

    updateWallpaper: async function() {
        try {
            // Step 1: Context Determination (Sport/Team)
            const teamsList = this.config.teams.length > 0 ? this.config.teams.join(", ") : "Any major team";
            const leaguesList = this.config.leagues.length > 0 ? this.config.leagues.join(", ") : "Any major league";
            const injection = this.config.promptInjection ? `Additional instructions: ${this.config.promptInjection}` : "";

            let contextPrompt = `Identify a major global sport today.   
            Team selection : Includes only one of the teams from this teams list (Randomly) : [${teamsList}] OR one team from this leagues list (Randomly):  [${leaguesList}].   
            Player Selection : It must contain one or more major player from this team selection.   
            Scene : Actual Team Sports stadium atmosphere, realistic to the sport (Number of players, players position on the field, camera angles, quantity of objects (balls, puck, sticks, etc...))
            ${injection}
            Output : Return the team name, the player(s) name and a description of them in an realistic intense action scene.   This output will be used to send back to gemini to generate an image.`;

            const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.config.apiKey}`;
            const textPayload = {
                contents: [{ 
                    parts: [{ 
                        text: `${contextPrompt} Return ONLY the subject and description. No markdown.` 
                    }] 
                }]
            };

            const textReq = await fetch(textUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(textPayload)
            });
            
            const textJson = await textReq.json();
            const sportContext = textJson.candidates?.[0]?.content?.parts?.[0]?.text || "Sports stadium atmosphere";

            // Step 2: Build the Image Prompt based on preferences
            const colorStyle = this.config.color 
                ? "vibrant, dynamic colors, cinematic lighting, hyper-realistic" 
                : "black and white, noir aesthetic, high contrast, dramatic shadows, minimalist";
            
            const orientationStyle = this.config.orientation === "portrait" ? "vertical portrait orientation" : "horizontal landscape orientation";
            
            const fullPrompt = `A ${colorStyle} 4k wallpaper of ${sportContext}. 
            Format: ${this.config.aspectRatio}, ${orientationStyle}. 
            Style: Photorealistic, cinematic, clean background suitable for a UI overlay. 
            NO TEXT, NO LOGOS, NO WATERMARKS.`;

            // Save for Debug Display
            this.debugText = fullPrompt;

            // Step 3: Generate the Image
            const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
            const imagePayload = {
                contents: [{ 
                    parts: [{ 
                        text: fullPrompt
                    }] 
                }]
            };

            const imageReq = await fetch(imageUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(imagePayload)
            });

            const imageJson = await imageReq.json();
            
            const part = imageJson.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            
            if (part && part.inlineData && part.inlineData.data) {
                this.imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                this.loaded = true;
                this.updateDom(2000); 
            }

        } catch (error) {
            Log.error("MMM-GeminiWallpaper Error: " + error);
        }
    }
});
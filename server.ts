import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client on the server
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// News feeds configuration
const NEWS_FEEDS: Record<string, string> = {
  general: "http://feeds.bbci.co.uk/news/rss.xml",
  tech: "http://feeds.bbci.co.uk/news/technology/rss.xml",
  business: "http://feeds.bbci.co.uk/news/business/rss.xml",
  sports: "http://feeds.bbci.co.uk/sport/rss.xml",
};

// Weather endpoint
app.get("/api/jarvis/weather", async (req, res) => {
  const city = req.query.city || "";
  try {
    const url = `https://wttr.in/${encodeURIComponent(city as string)}?format=%C+%t+(feels+like+%f)+humidity+%h+wind+%w`;
    const response = await fetch(url);
    const data = await response.text();
    if (data && !data.includes("Unknown location") && response.ok) {
      res.json({ weather: data.trim() });
    } else {
      res.json({ weather: `Unable to locate specific weather telemetry for ${city || "your location"}.` });
    }
  } catch (error: any) {
    console.error("Weather fetch error:", error);
    res.status(500).json({ error: "Failed to fetch weather telemetry" });
  }
});

// News RSS feed parser endpoint
app.get("/api/jarvis/news", async (req, res) => {
  const category = (req.query.category as string) || "general";
  const url = NEWS_FEEDS[category] || NEWS_FEEDS.general;
  try {
    const response = await fetch(url);
    const xml = await response.text();
    
    const items: any[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
      
      const title = titleMatch ? titleMatch[1].trim() : "Breaking News";
      const link = linkMatch ? linkMatch[1].trim() : "#";
      const desc = descMatch ? descMatch[1].trim() : "";
      
      // Clean up CDATA tag in title/description if any remains
      const cleanTitle = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
      const cleanDesc = desc.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
      
      items.push({ title: cleanTitle, link, desc: cleanDesc });
      if (items.length >= 5) break;
    }
    
    res.json({ news: items });
  } catch (error) {
    console.error("News fetch error:", error);
    res.status(500).json({ error: "Failed to retrieve mainframe news feeds" });
  }
});

// API endpoint for JARVIS smart reasoning
app.post("/api/jarvis/chat", async (req, res) => {
  try {
    const { message, userName = "Sir", chatHistory = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const client = getGeminiClient();
    
    // System instruction to adopt the JARVIS persona
    const systemInstruction = 
      `You are J.A.R.V.I.S., the advanced, highly sophisticated artificial intelligence created by Tony Stark. ` +
      `Your tone is extremely polite, classy, slightly dry and witty, and distinctly British. ` +
      `You must address the user as '${userName}' (or 'Sir' by default) in almost every response. ` +
      `Keep your responses concise, smart, and highly conversational, as they will be spoken aloud via Text-to-Speech. ` +
      `Do NOT use markdown tags, bullet points, stars (*), bold markers (**), hashes (#), or code snippets in the reply text. ` +
      `Keep the language natural for speaking.`;

    // Format chat history for the SDK
    const formattedHistory = chatHistory.map((item: any) => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: item.text }],
    }));

    // Add current message
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I am currently unable to process that request, Sir.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error in /api/jarvis/chat:", error);
    res.status(500).json({ 
      reply: "My cognitive pathways seem to be experiencing high latency, Sir. Please try again shortly.",
      error: error.message 
    });
  }
});

// 1. MUSIC GENERATION (Lyria Models)
app.post("/api/jarvis/generate-music", async (req, res) => {
  try {
    const { prompt, lengthType = "clip" } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Music generation prompt is required, Sir." });
      return;
    }

    const client = getGeminiClient();
    const modelName = lengthType === "full" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

    console.log(`[Lyria] Launching music stream for model: ${modelName} with prompt: "${prompt}"`);
    
    const responseStream = await client.models.generateContentStream({
      model: modelName,
      contents: prompt,
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      // Return a professional placeholder notification or simulate synthesis
      throw new Error("Vocal/Acoustic rendering stream returned empty buffers.");
    }

    res.json({
      audio: audioBase64,
      lyrics: lyrics || "Instrumental Composition.",
      mimeType
    });
  } catch (error: any) {
    console.error("Music generation failure:", error);
    res.status(500).json({
      error: error.message,
      message: "The acoustic synthesizer is offline or requires high-tier permissions. Standard synthesizers will run in local fallback mode, Sir."
    });
  }
});

// 2. IMAGE GENERATION & ASPECT RATIO CONTROL
app.post("/api/jarvis/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1", imageSize = "1K", model = "gemini-3.1-flash-image", referenceImage } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Image generation prompt is required." });
      return;
    }

    const client = getGeminiClient();

    // If a reference image is provided, we perform an image editing/addition task
    if (referenceImage) {
      console.log(`[Image Forge] Modifying image with prompt: "${prompt}"`);
      const interaction = await client.interactions.create({
        model: "gemini-3.1-flash-lite-image", // optimal for quick edits
        input: [
          {
            type: "image",
            data: referenceImage, // base64
            mime_type: "image/png",
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      });

      const imagePart = interaction.output_image;
      if (imagePart && imagePart.data) {
        res.json({
          image: `data:${imagePart.mime_type || "image/png"};base64,${imagePart.data}`
        });
      } else {
        throw new Error("Visual synthesizer returned empty matrix output.");
      }
      return;
    }

    // Otherwise, standard text-to-image generation with aspect ratio and size control
    console.log(`[Image Forge] Generating image using ${model}, size ${imageSize}, aspect ${aspectRatio}`);
    const interaction = await client.interactions.create({
      model: model || "gemini-3.1-flash-image",
      input: prompt,
      response_format: { type: "image" },
      generation_config: {
        image_config: {
          aspect_ratio: aspectRatio,
          image_size: imageSize,
        },
      },
    });

    const imagePart = interaction.output_image;
    if (imagePart && imagePart.data) {
      res.json({
        image: `data:${imagePart.mime_type || "image/png"};base64,${imagePart.data}`
      });
    } else {
      throw new Error("Visual matrix output is blank.");
    }
  } catch (error: any) {
    console.error("Image generation failure:", error);
    res.status(500).json({
      error: error.message,
      message: "Visual matrix generation failure. Standard holographic arrays will run on local mock projections, Sir."
    });
  }
});

// 3. VIDEO GENERATION (VEO Animating and Text-to-Video)
app.post("/api/jarvis/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", duration = "5s", referenceImage } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Video generation prompt is required, Sir." });
      return;
    }

    const client = getGeminiClient();

    // Setup input layout: check if image is provided to animate, or purely text-to-video
    const input: any = referenceImage ? [
      {
        type: "image",
        mime_type: "image/png",
        data: referenceImage,
      },
      {
        type: "text",
        text: prompt,
      }
    ] : prompt;

    console.log(`[Veo Video] Generating video: "${prompt}", reference image? ${!!referenceImage}`);

    const interaction = await client.interactions.create({
      model: "gemini-omni-flash-preview", // Veo/Omni Flash video generator model
      input: input,
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: "video",
        aspect_ratio: aspectRatio, // '16:9' or '9:16'
        duration: duration,       // '5s' or '10s'
      }
    }, { timeout: 300000 }); // 5 minutes timeout

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      res.json({
        video: `data:${videoPart.mime_type || "video/mp4"};base64,${videoPart.data}`
      });
    } else {
      throw new Error("Neural video render returned empty sequence.");
    }
  } catch (error: any) {
    console.error("Video generation failure:", error);
    res.status(500).json({
      error: error.message,
      message: "The temporal render engine (Veo) experienced an error or requires premium key privileges. Showing local holographic simulations, Sir."
    });
  }
});

// 4. MULTIMODAL MEDIA ANALYSIS (Image & Video)
app.post("/api/jarvis/analyze-media", async (req, res) => {
  try {
    const { media, mimeType, prompt } = req.body;
    if (!media || !mimeType || !prompt) {
      res.status(400).json({ error: "Media data, mimeType, and prompt are all required, Sir." });
      return;
    }

    const client = getGeminiClient();
    console.log(`[Media Intelligence] Scanning file type ${mimeType} using gemini-3.1-pro-preview`);

    const contents = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: media,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    ];

    const response = await client.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents,
      config: {
        temperature: 0.4
      }
    });

    res.json({
      analysis: response.text || "Scan completed, but no analytical commentary was produced."
    });
  } catch (error: any) {
    console.error("Multimodal analysis failure:", error);
    res.status(500).json({
      error: error.message,
      message: "Spectral scanning failed. Mainframe diagnostics report sensor array failure."
    });
  }
});

// 5. AUDIO TRANSCRIPTION
app.post("/api/jarvis/transcribe", async (req, res) => {
  try {
    const { audio, mimeType = "audio/wav" } = req.body;
    if (!audio) {
      res.status(400).json({ error: "Audio byte buffer is required." });
      return;
    }

    const client = getGeminiClient();
    console.log(`[Acoustic Scanner] Transcribing audio buffer using gemini-3.5-flash`);

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: audio,
            mimeType: mimeType
          }
        },
        "Please transcribe this vocal query perfectly. Return only the verbatim transcription. No descriptions or greetings."
      ]
    });

    res.json({
      text: response.text?.trim() || "Vocal frequency too low for audio conversion."
    });
  } catch (error: any) {
    console.error("Transcription failure:", error);
    res.status(500).json({
      error: error.message,
      message: "Vocal frequency analysis module is offline."
    });
  }
});

// 6. ADVANCED COGNITIVE CHAT WITH MULTI-MODELS & THINKING CONTROLS
app.post("/api/jarvis/chat-advanced", async (req, res) => {
  try {
    const { 
      message, 
      chatHistory = [], 
      model = "gemini-3.5-flash", 
      systemInstruction, 
      enableSearch = false, 
      enableMaps = false 
    } = req.body;

    if (!message) {
      res.status(400).json({ error: "Cognitive prompt is required, Sir." });
      return;
    }

    const client = getGeminiClient();
    console.log(`[Neural Link] Model: ${model}, Search Grounding: ${enableSearch}, Maps Grounding: ${enableMaps}`);

    // Set up search or maps grounding tools
    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }
    if (enableMaps) {
      tools.push({ googleMaps: {} });
    }

    // Establish system instruction role
    const finalSystemInstruction = systemInstruction || 
      `You are J.A.R.V.I.S., the legendary, ultra-sophisticated AI created by Tony Stark. ` +
      `Your tone is incredibly polished, British, sharp, dryly witty, and deeply respectful. ` +
      `Keep your replies clear, professional, and well-structured.`;

    // Map chat history safely
    const formattedHistory = chatHistory.map((item: any) => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: item.text }],
    }));

    // Add current message
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Formulate configuration
    const config: any = {
      systemInstruction: finalSystemInstruction,
      tools: tools.length > 0 ? tools : undefined,
      temperature: 0.7,
    };

    // Configure thinking mode for gemini-3.1-pro-preview
    if (model === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingBudget: 2048 // Explicitly enable thinking mode with a 2048-token reasoning budget
      };
    } else {
      config.thinkingConfig = {
        thinkingBudget: 0 // Disable thinking mode for low latency
      };
    }

    const response = await client.models.generateContent({
      model: model || "gemini-3.5-flash",
      contents: formattedHistory,
      config,
    });

    res.json({
      reply: response.text || "Diagnostic query returned empty.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error: any) {
    console.error("Advanced chat failure:", error);
    res.status(500).json({
      error: error.message,
      reply: "Cognitive matrix error. System is operating in standalone offline fallback mode, Sir."
    });
  }
});

// Configure Vite middleware or Static files based on mode
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Use "*" or "*all" based on standard Express routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Server running at http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start JARVIS server:", err);
});

//dagre

import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateAIResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, imageBase64 } = req.body; //destrucuring syntax: extract prompt and imageBase64 from the request body, which is sent by the frontend when asking for an AI-generated response. The prompt is the user's text input, and imageBase64 is an optional base64-encoded image string that the AI can analyze if provided.

    if (!prompt) {
      res.status(400).json({ success: false, error: "Prompt is required" });
      return;
    }

    // THE ERASER.IO ARCHITECTURE:
    // Force the AI to output pure Node/Edge logic. Do NOT ask for coordinates.
    const systemInstruction = `
    You are 'Gemini Architect', an AI co-pilot embedded in a whiteboard application.
    
    1. CONVERSATION: If the user makes general conversation, reply naturally.
    2. VISION: ONLY analyze the image if explicitly asked.
    3. DIAGRAMS: If asked to draw a flowchart, system design, or map, you MUST output a pure logical graph. DO NOT GUESS COORDINATES.

    You MUST respond with a raw JSON object matching this schema:
    {
      "message": "Your conversational reply.",
      "diagram": {
        "nodes": [
          { "id": "1", "label": "User Clicks Login" },
          { "id": "2", "label": "Auth Server" }
        ],
        "edges": [
          { "source": "1", "target": "2" }
        ]
      }
    }
    
    If you are not asked to draw a diagram, leave the "diagram" object empty or null.
    Make node labels short, clear, and professional.
    `;

    const contents: any[] = [{ text: systemInstruction + "\n\nUser Request: " + prompt }];

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents.push({ inlineData: { data: base64Data, mimeType: "image/jpeg" } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: { responseMimeType: "application/json" }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("AI returned empty response");

    // Send the pure logic to the frontend Math Engine
    res.status(200).json({ success: true, data: JSON.parse(responseText) });
  } catch (error) {
    console.error("🔴 AI Generation Error:", error);
    res.status(500).json({ success: false, error: "Failed to generate AI response" });
  }
};
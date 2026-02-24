// import { Request, Response } from 'express';
// import { GoogleGenAI } from '@google/genai';
// import { v4 as uuidv4 } from 'uuid';

// // Initialize the new Google SDK
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export const generateAIResponse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { prompt, imageBase64 } = req.body;

//     if (!prompt) {
//       res.status(400).json({ success: false, error: "Prompt is required" });
//       return;
//     }

//     // 1. The Upgraded Master Prompt: Conversation vs. Architecture Modes
//     const systemInstruction = `
//     You are 'Gemini Architect', an AI co-pilot embedded in a real-time digital whiteboard application.
    
//     CRITICAL BEHAVIORAL RULES:
//     1. CONVERSATION FIRST: If the user just says a greeting (like "hello", "hi") or makes general conversation, reply naturally and politely. DO NOT analyze the board or draw shapes.
//     2. VISION AWARENESS: You will receive an image of the current whiteboard with every request. ONLY analyze or describe the image if the user explicitly asks you to (e.g., "what is on the board?", "summarize this diagram").
//     3. DRAWING: ONLY generate shapes if the user explicitly commands you to draw, map, or create a diagram/flowchart.

//     You MUST ALWAYS respond with a raw JSON object matching this exact schema:
//     {
//       "message": "Your conversational reply or explanation to the user.",
//       "shapes": [] // Leave this array EMPTY unless you are specifically asked to draw something.
//     }

//     DRAWING INSTRUCTIONS (Execute ONLY if asked to draw):
//     - Do NOT generate "id" fields. The system will handle IDs.
//     - You MUST use this Grid System to prevent overlaps: Column 1 starts at x: 100, Col 2 at 400, Col 3 at 700. Row 1 starts at y: 100, Row 2 at 250, Row 3 at 400.
//     - For EVERY node in the flowchart, generate TWO shapes: ONE "rectangle" and ONE "text".
//     - 1. Rectangle Example: {"type":"rectangle", "x":100, "y":100, "width":200, "height":80, "stroke":"#000000", "strokeWidth":2}
//     - 2. Text Example (place inside the rectangle): {"type":"text", "x":120, "y":130, "text":"User Login", "fontSize":18, "stroke":"#000000"}
//     - 3. Line Example (connecting boxes): {"type":"line", "points":[300, 140, 400, 140], "stroke":"#000000", "strokeWidth":2}
//     `;

//     const contents: any[] = [
//       { text: systemInstruction + "\n\nUser Request: " + prompt }
//     ];

//     if (imageBase64) {
//       const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
//       contents.push({
//         inlineData: {
//           data: base64Data,
//           mimeType: "image/jpeg"
//         }
//       });
//     }

//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: contents,
//       config: {
//         responseMimeType: "application/json", 
//       }
//     });

//     const responseText = response.text;
    
//     if (!responseText) {
//       throw new Error("AI returned empty response");
//     }

//     const aiData = JSON.parse(responseText);
    
//     // FIX: Forcefully inject a mathematically unique UUID into EVERY shape the AI generates.
//     // This physically prevents the React duplicate key error.
//     if (aiData.shapes && Array.isArray(aiData.shapes)) {
//         aiData.shapes = aiData.shapes.map((s: any) => ({ ...s, id: uuidv4() }));
//     }

//     res.status(200).json({ success: true, data: aiData });
//   } catch (error) {
//     console.error("🔴 AI Generation Error:", error);
//     res.status(500).json({ success: false, error: "Failed to generate AI response" });
//   }
// };


//dagre

import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateAIResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, imageBase64 } = req.body;

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
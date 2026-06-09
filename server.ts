import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateExpressionPrompt, generateImage } from "./lib/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use a higher JSON limit for image uploads
  app.use(express.json({ limit: "15mb" }));

  // API endpoint - Handles image generation from prompt
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, style } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided." });
      }

      const imageUrl = await generateImage(prompt, style);
      return res.json({ imageUrl });
    } catch (err: any) {
      console.error("Error generating image:", err);
      return res.status(500).json({
        error: err.message || "An error occurred during image generation."
      });
    }
  });

  // API endpoint - Handles image + expressions analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image, mimeType, landmarkSummary, gazeDirection } = req.body;

      if (!image) {
        return res.status(400).json({ error: "No image provided." });
      }

      if (!mimeType) {
        return res.status(400).json({ error: "No mimeType provided." });
      }

      // Extract base64 segment from base64 Data URL if present
      let rawBase64 = image;
      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          rawBase64 = matches[2];
        }
      }

      const generatedPrompt = await generateExpressionPrompt(
        rawBase64,
        mimeType,
        landmarkSummary || { faceFound: false },
        gazeDirection
      );

      return res.json({ prompt: generatedPrompt });
    } catch (err: any) {
      console.error("Error running expression analyzer:", err);
      return res.status(500).json({
        error: err.message || "An error occurred during facial expression analysis."
      });
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode (with Vite dev middleware)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});

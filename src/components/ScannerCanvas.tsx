import React, { useRef, useState, useEffect } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { Upload, HelpCircle, Eye, Scan, RefreshCw, Star, Sparkles, Cpu, Wand2, Camera } from "lucide-react";
import { LandmarkAnalysis } from "../types";
import { calculateBiomechanicalMetrics } from "../lib/landmarks";

interface ScannerCanvasProps {
  onFaceDetected: (imageSrc: string, mimeType: string, analysis: LandmarkAnalysis) => void;
  onReset: () => void;
  imageUrl?: string;
  isProcessing: boolean;
}

export default function ScannerCanvas({ onFaceDetected, onReset, imageUrl, isProcessing }: ScannerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [localImageSrc, setLocalImageSrc] = useState<string | null>(imageUrl || null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [hasFace, setHasFace] = useState<boolean | null>(null);

  // Lazy loading fileset resolver & face landmarker on client side
  useEffect(() => {
    const initLandmarker = async () => {
      try {
        setModelLoading(true);
        setStatusText("Booting kid-friendly robot scanners...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        setStatusText("Pouring colorful candy coordinates...");
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numFaces: 1,
        });
        setFaceLandmarker(landmarker);
        setStatusText("Ready! Feed me a silly face photo!");
        setModelLoading(false);
      } catch (err) {
        console.error("Failed to load FaceLandmarker models:", err);
        setStatusText("Robot is slightly confused! Using smart eye-scan fallback!");
        setModelLoading(false);
      }
    };

    if (!faceLandmarker) {
      initLandmarker();
    }
  }, []);

  // Run MediaPipe whenever a new image is loaded
  const processImage = (src: string, mimeType: string) => {
    setLocalImageSrc(src);
    setHasFace(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!faceLandmarker) {
        // Dynamic fallback if MediaPipe failed to load
        onFaceDetected(src, mimeType, { faceFound: false, landmarksCount: 0 });
        return;
      }

      try {
        setStatusText("Mapping face points into candy crumbs...");
        const results = faceLandmarker.detect(img);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Check if coordinates were returned
            if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
              setHasFace(true);
              setStatusText("Presto! Smile metrics formulated!");
              
              const rawLandmarks = results.faceLandmarks[0];
              
              // Draw Cute & Colorful candy dot overlay mapping
              drawCandyMesh(ctx, rawLandmarks, canvas.width, canvas.height);

              // Calculate Metrics
              const metrics = calculateBiomechanicalMetrics(rawLandmarks);
              
              onFaceDetected(src, mimeType, {
                faceFound: true,
                landmarksCount: rawLandmarks.length,
                simplifiedData: metrics,
              });
            } else {
              setHasFace(false);
              setStatusText("No face detected, analyzing expression visually anyway!");
              onFaceDetected(src, mimeType, { faceFound: false, landmarksCount: 0 });
            }
          }
        }
      } catch (error) {
        console.error("Error detecting face:", error);
        setStatusText("Scan fallback activated! Generating spell...");
        onFaceDetected(src, mimeType, { faceFound: false, landmarksCount: 0 });
      }
    };
    img.src = src;
  };

  const drawCandyMesh = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Generate lovely pastel nodes
    // Instead of digital-only cyan, make them glowing warm candy colors
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgb(236, 72, 153)"; // Pink-500 glow

    // Draw nodes
    landmarks.forEach((pt, index) => {
      const x = pt.x * width;
      const y = pt.y * height;
      
      // Alternate candy dot colors of the face mesh points
      if (index % 4 === 0) {
        ctx.fillStyle = "rgb(236, 72, 153)"; // Sweet Pink
      } else if (index % 4 === 1) {
        ctx.fillStyle = "rgb(250, 204, 21)"; // Sun Yellow
      } else if (index % 4 === 2) {
        ctx.fillStyle = "rgb(34, 211, 238)"; // Sky Blue
      } else {
        ctx.fillStyle = "rgb(168, 85, 247)"; // Playful Purple
      }

      ctx.beginPath();
      ctx.arc(x, y, Math.max(width * 0.0022, 1.8), 0, 2 * Math.PI);
      ctx.fill();
    });

    // Connector loops for cute stylized mask outline
    const connectCandyPoints = (indices: number[], strokeColor: string, weight: number) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = weight;
      ctx.beginPath();
      indices.forEach((idx, i) => {
        const pt = landmarks[idx];
        if (!pt) return;
        const x = pt.x * width;
        const y = pt.y * height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    };

    // Cheek structure smiley lines connect!
    connectCandyPoints([33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33], "rgba(236, 72, 153, 0.6)", Math.max(width * 0.002, 1.5));
    connectCandyPoints([263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263], "rgba(236, 72, 153, 0.6)", Math.max(width * 0.002, 1.5));
    
    // Funny smiling mouth shape border outline
    connectCandyPoints([61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 95, 61], "rgba(250, 204, 21, 0.7)", Math.max(width * 0.0025, 2));

    ctx.shadowBlur = 0; // reset
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            processImage(event.target.result as string, file.type);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            processImage(event.target.result as string, file.type);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleClickUpload = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  return (
    <div id="scanner-wrapper" className="w-full flex flex-col items-center">
      {/* File Drop/Scanner Zone */}
      {!localImageSrc ? (
        <div
          id="dropzone"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={`relative w-full aspect-[4/3] md:aspect-[16/10] max-w-xl mx-auto rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer p-6 overflow-hidden shadow-[6px_6px_0px_#000] ${
            dragActive
              ? "border-amber-400 bg-amber-950/20 scale-[1.01]"
              : "border-slate-950 bg-[#2a2929] hover:border-amber-400 hover:bg-[#353333]"
          }`}
        >
          {/* Adorable stars & circles floating motif */}
          <div className="absolute inset-0 bg-[#312f2f]/30 pointer-events-none opacity-40"></div>
          
          <Star className="absolute top-4 left-4 w-5 h-5 text-amber-400 fill-amber-400 animate-pulse pointer-events-none" />
          <Sparkles className="absolute top-4 right-4 w-5 h-5 text-pink-400 pointer-events-none" />
          <Cpu className="absolute bottom-4 left-4 w-5 h-5 text-purple-400 pointer-events-none" />
          <Wand2 className="absolute bottom-4 right-4 w-5 h-5 text-cyan-400 pointer-events-none" />

          <div className="text-center space-y-4 max-w-xs z-10">
            <div className="w-16 h-16 rounded-full bg-slate-950 border-3 border-slate-900 flex items-center justify-center mx-auto shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-amber-300 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-sans font-black text-white tracking-tight text-lg">
                Drag & Drop a Selfie!
              </p>
              <p className="text-xs text-slate-300 mt-1 font-sans font-semibold">
                Snap a funny expression, smile, or grumpy face & upload!
              </p>
            </div>
            <button
              type="button"
              id="upload-btn"
              className="py-2 px-5 bg-amber-400 text-slate-950 border-3 border-slate-950 rounded-2xl text-xs font-sans font-black tracking-wider hover:bg-amber-300 transition duration-150 uppercase shadow-[3px_3px_0px_#000]"
            >
              Pick a Portrait file
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto flex flex-col space-y-4">
          {/* Active Canvas Scan Area */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-slate-950 bg-slate-950 shadow-[6px_6px_0px_#000] aspect-auto flex justify-center items-center max-h-[460px]">
            {/* The base canvas that shows image + landmark points */}
            <canvas
              ref={canvasRef}
              className="w-full max-w-full h-auto object-contain block max-h-[460px] max-w-xl"
            />
            
            {/* Hiding original static image */}
            <img
              ref={imageRef}
              src={localImageSrc}
              alt="Scan source"
              className="hidden"
            />

            {/* Glowing cartoon style Laser scan line */}
            {(isProcessing || hasFace === null) && (
              <div
                id="laser-line"
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(250,204,21,0.9)]"
                style={{
                  top: "calc(30% + 40% * sin(90deg))",
                  animation: "scanLine 2.5s infinite ease-in-out"
                }}
              ></div>
            )}

            {/* Playful Frame Corners */}
            <Star className="absolute top-4 left-4 w-4 h-4 text-amber-300 fill-amber-300 animate-pulse pointer-events-none" />
            <Sparkles className="absolute top-4 right-4 w-4 h-4 text-pink-400 pointer-events-none" />
            <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-cyan-400 pointer-events-none" />
            <Star className="absolute bottom-4 right-4 w-4 h-4 text-purple-400 fill-purple-400 animate-pulse pointer-events-none" />

            {/* Interactive labels for kids visual overlay */}
            <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none font-sans font-black text-xs text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4 flex justify-center">
              <span className="bg-slate-950/80 border-2 border-slate-900 px-3 py-1 rounded-full uppercase text-[10px] tracking-wider text-amber-300 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                BIOMETRIC MAPPING MASK : ENABLED
              </span>
            </div>
          </div>

          {/* Controller Indicators / Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#2a2929] border-3 border-slate-950 rounded-2xl gap-3 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center space-x-2.5">
              <Wand2 className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-sans font-bold text-slate-200">
                {statusText || "Photo loaded successfully."}
              </p>
            </div>
            <button
              id="reset-scan"
              onClick={() => {
                setLocalImageSrc(null);
                setHasFace(null);
                onReset();
              }}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-4 py-2 bg-pink-500 text-white border-3 border-slate-950 rounded-xl text-xs font-sans font-black hover:bg-pink-400 active:scale-95 transition-all shadow-[2px_2px_0px_#000] disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reset & Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Playful Model Loading process banner */}
      {modelLoading && (
        <div className="mt-4 w-full max-w-xl text-center bg-slate-950/40 p-2.5 rounded-full border border-slate-900">
          <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-300 animate-pulse uppercase">
            PREPARING PLAYFUL FACE FILTERS • PLEASE HOLD ON
          </p>
        </div>
      )}
    </div>
  );
}

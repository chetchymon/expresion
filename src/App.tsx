import React, { useState } from "react";
import { Sparkles, ShieldAlert, Heart, Laugh, Compass, UserCircle, HelpCircle, RefreshCw, Camera, Cpu, Smile, SmilePlus, Gamepad2 } from "lucide-react";
import ScannerCanvas from "./components/ScannerCanvas";
import BiometricsDashboard from "./components/BiometricsDashboard";
import { LandmarkAnalysis, GeneratedResult } from "./types";

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<string>("");

  // Handler for image face detection & prompt synthesis
  const handleFaceDetected = async (imageSrc: string, mimeType: string, analysis: LandmarkAnalysis) => {
    setIsProcessing(true);
    setError(null);
    setAnalysisProgress("Magic scanners are tracing your face...");

    try {
      // Fun transitions for the kids UI flow
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAnalysisProgress("Smart robot brains are reading your smile muscles...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAnalysisProgress("Writing your magical image-generator spell...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageSrc,
          mimeType: mimeType,
          landmarkSummary: analysis,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Magic spell synthesis failed.");
      }

      const data = await response.json();

      setResult({
        prompt: data.prompt,
        landmarkAnalysis: analysis,
        imageUrl: imageSrc,
      });
    } catch (err: any) {
      console.error("Analysis api error:", err);
      setError(err.message || "Failed to make magic spell. Is your GEMINI_API_KEY set up?");
    } finally {
      setIsProcessing(false);
      setAnalysisProgress("");
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsProcessing(false);
    setAnalysisProgress("");
  };

  return (
    <div className="min-h-screen bg-[#1f1e1e] text-[#f4f4f3] flex flex-col font-sans selection:bg-amber-400/40 selection:text-amber-200">
      {/* Playful background glowing circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Simple, clean top navigation bar */}
      <header className="border-b-4 border-slate-900 bg-slate-900/60 sticky top-0 z-40 backdrop-blur-md">
        <div id="header-container" className="max-w-6xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-start gap-3">
          <img 
            src="https://i.postimg.cc/yd79fznb/422281211726072-removebg-preview.png" 
            alt="ExpressionPrompt Logo" 
            className="h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <h1 className="font-sans font-black text-2xl text-white tracking-tight drop-shadow-md">
            ExpressionPrompt
          </h1>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-8 py-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Instructions and Scan Input */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3 bg-[#2a2929] border-4 border-slate-950 p-6 rounded-3xl shadow-[6px_6px_0px_#000]">
            <div className="flex items-center space-x-2">
              <SmilePlus className="w-8 h-8 text-amber-300 stroke-[2.5]" />
              <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-amber-300">
                Want to recreate your goofy face?
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
              Simply drop an image of your funniest facial pose! Our cartoon facial scanner tracks your lips and squinty eyes, then crafts an <strong className="text-pink-400">awesome text spell</strong> to create exactly the same funny expression in AI generators (like Flux, Midjourney, SDXL, and ChatGPT)!
            </p>
            
            {/* Playful Step Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-[#1f1e1e] p-2.5 rounded-xl border-2 border-slate-950 text-center flex flex-col items-center justify-center gap-1 shadow-[2px_2px_0px_#000]">
                <Camera className="w-5 h-5 text-amber-300" />
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">1. Drop Photo</span>
              </div>
              <div className="bg-[#1f1e1e] p-2.5 rounded-xl border-2 border-slate-950 text-center flex flex-col items-center justify-center gap-1 shadow-[2px_2px_0px_#000]">
                <Cpu className="w-5 h-5 text-pink-400" />
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">2. Face scan</span>
              </div>
              <div className="bg-[#1f1e1e] p-2.5 rounded-xl border-2 border-slate-950 text-center flex flex-col items-center justify-center gap-1 shadow-[2px_2px_0px_#000]">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">3. Copy spell</span>
              </div>
            </div>
          </div>

          {/* Core Interactive Scanner Component */}
          <ScannerCanvas
            onFaceDetected={handleFaceDetected}
            onReset={handleReset}
            isProcessing={isProcessing}
            imageUrl={result?.imageUrl}
          />

          {/* Quick instructions / Help popup panel */}
          <div className="p-4 rounded-2xl border-3 border-slate-950 bg-amber-400 text-slate-950 flex items-start space-x-3 shadow-[4px_4px_0px_#000] hover:translate-y-[-1px] transition-all">
            <HelpCircle className="w-5 h-5 text-slate-950 shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="text-xs space-y-1">
              <span className="flex items-center gap-1.5 font-sans font-black text-slate-950">
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>How to use your magical spell:</span>
              </span>
              <p className="font-medium">Copy your new expression prompt, then paste it into any AI art program! It tells the robot exactly how to bend the face, squint the eyes, and pull the lips of your next characters!</p>
            </div>
          </div>
        </div>

        {/* Right Side: Process Monitor or Results Dashboard */}
        <div className="lg:col-span-6 w-full space-y-6">
          {/* Default Unprocessed Playful State */}
          {!isProcessing && !result && !error && (
            <div className="rounded-3xl border-4 border-slate-950 bg-[#2a2929] p-8 text-center flex flex-col items-center justify-center space-y-5 aspect-[4/3] max-w-xl mx-auto shadow-[6px_6px_0px_#000]">
              <div className="w-16 h-16 rounded-full border-3 border-slate-950 bg-indigo-950 flex items-center justify-center animate-bounce shadow-[3px_3px_0px_#000]">
                <UserCircle className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-sans font-black text-amber-300 text-base md:text-lg">Waiting for your silly snapshot!</h3>
                <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-sans mx-auto">
                  Populate the scanner window on the left. Drop any selfie, and watch the magical points light up!
                </p>
              </div>
              <div id="quick-metric-dummy" className="py-1 px-4 rounded-full bg-slate-950/80 border-2 border-slate-900 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>ROBOT RADAR ON BYSTANDER</span>
              </div>
            </div>
          )}

          {/* Active processing state with adorable micro-animations */}
          {isProcessing && (
            <div id="processing-overlay" className="rounded-3xl border-4 border-slate-950 bg-[#2a2929] p-8 text-center flex flex-col items-center justify-center space-y-6 aspect-[4/3] max-w-xl mx-auto shadow-[6px_6px_0px_#000]">
              <div className="relative">
                {/* Playful concentric rotating bouncy frames */}
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-pink-500 animate-spin" style={{ animationDuration: "3s" }}></div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-double border-amber-400 animate-pulse"></div>
                <div className="absolute inset-x-0 mx-auto top-1/2 -translate-y-1/2 w-8 h-8 text-white flex items-center justify-center font-bold text-xl">
                  <Gamepad2 className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              <div className="space-y-3">
                <span className="bg-pink-600 text-white border-2 border-slate-950 px-3 py-1 rounded-full text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 max-w-max mx-auto shadow-[2px_2px_0px_#000]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>CALCULATING SILLINESS RATIO</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </span>
                <h3 className="font-sans font-black text-white text-lg md:text-xl">
                  {analysisProgress}
                </h3>
                <p className="text-xs text-slate-300 font-sans max-w-xs leading-relaxed mx-auto">
                  Detecting smile muscles, raising eyebrows, testing squint indexes, and preparing your image-generation cheat code!
                </p>
              </div>
            </div>
          )}

          {/* Error Message with playful recovery advice */}
          {error && (
            <div id="error-screen" className="rounded-3xl border-4 border-red-950 bg-red-950/20 p-6 space-y-4 max-w-xl mx-auto shadow-[6px_6px_0px_#000]">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-red-900/50 border-3 border-slate-950 shrink-0 shadow-[2px_2px_0px_#000]">
                  <ShieldAlert className="w-6 h-6 text-red-200" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h3 className="font-sans font-black text-red-200 text-base">Oops! The computer got confused!</h3>
                  <p className="text-xs text-red-300 leading-relaxed font-sans font-medium">{error}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-amber-400 text-slate-950 border-3 border-slate-950 rounded-2xl text-xs font-sans font-black tracking-wider hover:bg-amber-300 hover:-translate-y-0.5 active:translate-y-0 transition duration-150 uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2"
              >
                <span>Let's Try Again!</span>
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Beautiful and fun Result Output Dashboard */}
          {result && !isProcessing && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-300">
              <BiometricsDashboard
                prompt={result.prompt}
                landmarkAnalysis={result.landmarkAnalysis}
                isProcessing={isProcessing}
              />
            </div>
          )}
        </div>
      </main>

      {/* Playful, chunky footer panel */}
      <footer className="border-t-4 border-slate-900 py-6 mt-12 bg-slate-900/30">
        <div id="footer-container" className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
          <p className="flex items-center space-x-1.5 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-sans font-semibold">ExpressionPrompt AI. Copycat spells made cute for everyone!</span>
          </p>
          <div className="flex items-center space-x-4 font-bold text-[10px] text-amber-300/80">
            <span>FLUX & MIDJOURNEY FRIENDLY</span>
            <span>SECURE SANDBOXED FUN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

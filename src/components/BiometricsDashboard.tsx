import React, { useState } from "react";
import { Copy, Check, Info, Smile, Eye, Sliders, LayoutGrid, Compass, BarChart3, Target, Sparkles, Star, Wand2 } from "lucide-react";
import { LandmarkAnalysis } from "../types";

interface BiometricsDashboardProps {
  prompt: string;
  landmarkAnalysis?: LandmarkAnalysis;
  isProcessing: boolean;
}

export default function BiometricsDashboard({ prompt, landmarkAnalysis, isProcessing }: BiometricsDashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert commas into playful chip bubbles for children/creatives
  const promptChips = prompt
    ? prompt
        .split(",")
        .map((chip) => chip.trim())
        .filter((chip) => chip.length > 0)
    : [];

  const metrics = landmarkAnalysis?.faceFound ? landmarkAnalysis.simplifiedData : null;

  return (
    <div id="biometrics-dashboard" className="w-full max-w-xl mx-auto space-y-6">
      {/* Playful Biometrics Bento Boxes (Only shows if face found) */}
      {metrics && (
        <div id="biometrics-panel" className="rounded-3xl border-4 border-slate-950 bg-[#2a2929] p-5 space-y-4 shadow-[6px_6px_0px_#000]">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 pb-3 gap-2">
            <h3 className="font-sans font-black text-white text-base tracking-tight flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-amber-300" />
              <span className="text-amber-300">Your Silly Face Analysis</span>
            </h3>
            <span className="text-[10px] sm:text-xs font-mono font-bold bg-pink-950 text-pink-300 border-2 border-slate-950 px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_#000] flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>{landmarkAnalysis?.landmarksCount} Face points mapped</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Smile index */}
            <div className="p-3.5 rounded-2xl bg-[#1f1e1e] border-3 border-slate-950 shadow-[3px_3px_0px_#000]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-sans font-black text-rose-300 uppercase tracking-widest flex items-center space-x-1.5">
                  <Smile className="w-4 h-4 text-rose-300" />
                  <span>Smile Power</span>
                </span>
                <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                  {Math.max(0, Math.round((metrics.smileCoefficient.smileAvg + 0.015) * 2000))}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(8, (metrics.smileCoefficient.smileAvg + 0.015) * 200 * 10))}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 font-sans font-semibold italic">
                {metrics.smileCoefficient.label}
              </p>
            </div>

            {/* 2. Eye compression / openness */}
            <div className="p-3.5 rounded-2xl bg-[#1f1e1e] border-3 border-slate-950 shadow-[3px_3px_0px_#000]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-sans font-black text-cyan-300 uppercase tracking-widest flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-cyan-300" />
                  <span>Eyes Squint</span>
                </span>
                <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                  {Math.round(((metrics.eyeRatio.leftOpenness + metrics.eyeRatio.rightOpenness) / 2) * 400)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(8, ((metrics.eyeRatio.leftOpenness + metrics.eyeRatio.rightOpenness) / 2) * 350))}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 font-sans font-semibold italic">
                {metrics.eyeRatio.label}
              </p>
            </div>

            {/* 3. Eyebrow tension */}
            <div className="p-3.5 rounded-2xl bg-[#1f1e1e] border-3 border-slate-950 shadow-[3px_3px_0px_#000]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-sans font-black text-amber-300 uppercase tracking-widest flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-amber-300" />
                  <span>Brow Height</span>
                </span>
                <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                  {Math.round(((metrics.browOpenness.leftBrowHeight + metrics.browOpenness.rightBrowHeight) / 2) * 500)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(8, ((metrics.browOpenness.leftBrowHeight + metrics.browOpenness.rightBrowHeight) / 2) * 500))}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 font-sans font-semibold italic">
                {metrics.browOpenness.label}
              </p>
            </div>

            {/* 4. Head tilt */}
            <div className="p-3.5 rounded-2xl bg-[#1f1e1e] border-3 border-slate-950 shadow-[3px_3px_0px_#000]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-sans font-black text-purple-300 uppercase tracking-widest flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-purple-300 animate-pulse" />
                  <span>Head Tilt</span>
                </span>
                <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                  {metrics.headPose.tiltAngle}°
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(25, Math.abs(metrics.headPose.tiltAngle) * 5.5))}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 font-sans font-semibold italic">
                {metrics.headPose.label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Output Prompt Spell Card */}
      <div id="prompt-output-card" className="rounded-3xl border-4 border-slate-950 bg-[#2a2929] p-6 shadow-[6px_6px_0px_#000] space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase flex items-center gap-1.5 mb-0.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>MAGIC DRAWING SPELL READY</span>
            </span>
            <h3 className="font-sans font-black text-white text-lg tracking-tight">
              Expression Replica Prompt
            </h3>
          </div>
          <button
            id="copy-prompt-btn"
            onClick={handleCopy}
            disabled={!prompt || isProcessing}
            className="flex items-center space-x-1.5 px-4.5 py-2 bg-amber-400 text-slate-950 rounded-2xl text-xs font-sans font-black hover:bg-amber-300 active:scale-95 transition-all shadow-[4px_4px_0px_#000] border-3 border-slate-950 disabled:opacity-40 disabled:pointer-events-none"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Spell Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 stroke-[2.5]" />
                <span>Copy Magic Spell</span>
              </>
            )}
          </button>
        </div>

        {/* Text Area display with cute inner container */}
        <div className="relative p-5 rounded-2xl bg-[#1f1e1e] border-3 border-slate-950 shadow-[inner_0_2px_4px_rgba(0,0,0,0.5)]">
          <p className="text-sm font-mono text-amber-200 leading-relaxed whitespace-pre-wrap select-all font-bold">
            {prompt || "Put a silly selfie photo on the scanner to see the magic happen!"}
          </p>

          <span className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-550 font-bold uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-slate-500" />
            <span>FLUX • MD • SDXL CHEAT CODE</span>
          </span>
        </div>

        {/* Chips layout styled nicely like candy drops */}
        {promptChips.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-sans font-black text-slate-300 flex items-center space-x-1.5">
              <Wand2 className="w-4 h-4 text-pink-400" />
              <span>Magic Spell Ingredients:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {promptChips.map((chip, i) => (
                <span
                  key={i}
                  className="bg-slate-950/60 hover:bg-amber-400/25 text-pink-300 hover:text-amber-200 border-2 border-slate-950 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all duration-100 cursor-default shadow-[2px_2px_0px_#000] flex items-center gap-1"
                >
                  <Star className="w-3 h-3 text-pink-400 fill-pink-400 pr-0.5" />
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic ChatGPT & Minor Safety Companion Card */}
      <div id="safety-companion-card" className="rounded-3xl border-4 border-slate-950 bg-amber-400 text-slate-950 p-6 shadow-[6px_6px_0px_#000] space-y-3.5">
        <div className="flex items-center space-x-2.5 border-b-2 border-slate-950 pb-2">
          <Sparkles className="w-5 h-5 text-slate-950 shrink-0 stroke-[2.5]" />
          <h4 className="font-sans font-black text-sm md:text-base text-slate-950 uppercase tracking-tight">
            🌈 Fun & Safe Copycat Spells!
          </h4>
        </div>
        
        <div className="text-xs space-y-2.5 font-sans font-medium text-slate-950 leading-relaxed">
          <p>
            AI creators (like ChatGPT and DALL-E 3) have extra-sensitive safety filters when generating images with teenagers or kids. Because this app is built for <strong>pure, safe, imaginative fun</strong>, we have automatically pre-scrubbed your magic spell!
          </p>
          
          <div className="p-3 bg-white/40 rounded-xl space-y-2 border-2 border-slate-950 font-sans font-semibold text-[11px]">
            <p className="font-sans font-black text-xs text-slate-950">🔮 3 Easy Steps to Generate Flawlessly:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>
                <strong className="text-slate-900">Avoid Age / Teen words in ChatGPT:</strong> Don't say "14-year-old", "minor", or "student". Instead, write general words like <strong className="text-teal-950">"character"</strong>, <strong className="text-teal-950">"young explorer"</strong>, or <strong className="text-teal-950">"animated protagonist"</strong>.
              </li>
              <li>
                <strong className="text-slate-900">Embrace Cartoon / Pixar Styles:</strong> Describe the character as an <strong className="text-purple-900">"adorable 3D Pixar-style digital cartoon character"</strong>. AI safety filters love animated styles and will never block them!
              </li>
              <li>
                <strong className="text-slate-900">Pre-Scrubbed Security:</strong> We have removed common physical trigger words (like <em>"tension"</em> or <em>"pout"</em>) to keep your prompt 100% kid-safe and filter-friendly.
              </li>
            </ul>
          </div>
          
          <p className="text-[10.5px] font-mono text-slate-900 font-bold text-center">
            🚀 Try writing: <span className="underline">"Pixar 3D style character of a young hero with [Paste Copycat Spell here]"</span>
          </p>
        </div>
      </div>
    </div>
  );
}

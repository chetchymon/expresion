import React, { useState, useRef, useEffect } from "react";
import { Move, Sparkles, HelpCircle, Eye } from "lucide-react";

export type GazeDirection =
  | "center"
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right"
  | "cross";

interface GazeDirectorProps {
  value: GazeDirection;
  onChange: (gaze: GazeDirection) => void;
}

export const GAZE_DESCRIPTIONS: Record<GazeDirection, { label: string; emoji: string; text: string }> = {
  center: { label: "Straight Ahead", emoji: "👁️", text: "looking straight ahead" },
  up: { label: "Looking Up", emoji: "🙄", text: "eyeballs rolled up looking towards the sky" },
  down: { label: "Looking Down", emoji: "👇", text: "eyes looking downward in contemplation" },
  left: { label: "Looking Left", emoji: "👈", text: "eyes looking sharply to the left side" },
  right: { label: "Looking Right", emoji: "👉", text: "eyes looking sharply to the right side" },
  "up-left": { label: "Up Left", emoji: "↖️", text: "eyes looking to the upper-left" },
  "up-right": { label: "Up Right", emoji: "↗️", text: "eyes looking to the upper-right" },
  "down-left": { label: "Down Left", emoji: "↙️", text: "eyes looking down towards the left" },
  "down-right": { label: "Down Right", emoji: "↘️", text: "eyes looking down towards the right" },
  cross: { label: "Cross-Eyed 🤪", emoji: "🤪", text: "hilariously cross-eyed with both pupils pointing inward" },
};

export default function GazeDirector({ value, onChange }: GazeDirectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverOffset, setHoverOffset] = useState<{ x: number; y: number } | null>(null);

  // Predefined pixel offsets for pupil positioning
  const getPupilTransform = (gaze: GazeDirection, isLeftEye: boolean) => {
    // If the mouse is hovering over the sandbox, follow the mouse smoothly!
    if (hoverOffset) {
      if (gaze === "cross") {
        // Cross eyed has inner weights
        const crossX = isLeftEye ? 12 : -12;
        return {
          transform: `translate(${hoverOffset.x * 0.6 + crossX}px, ${hoverOffset.y * 0.6}px)`,
        };
      }
      return {
        transform: `translate(${hoverOffset.x}px, ${hoverOffset.y}px)`,
      };
    }

    // Otherwise, use preset constants
    switch (gaze) {
      case "up":
        return { transform: "translate(0px, -20px)" };
      case "down":
        return { transform: "translate(0px, 20px)" };
      case "left":
        return { transform: "translate(-22px, 0px)" };
      case "right":
        return { transform: "translate(22px, 0px)" };
      case "up-left":
        return { transform: "translate(-16px, -16px)" };
      case "up-right":
        return { transform: "translate(16px, -16px)" };
      case "down-left":
        return { transform: "translate(-16px, 16px)" };
      case "down-right":
        return { transform: "translate(16px, 16px)" };
      case "cross":
        return { transform: isLeftEye ? "translate(16px, 0px)" : "translate(-16px, 0px)" };
      case "center":
      default:
        return { transform: "translate(0px, 0px)" };
    }
  };

  // Handle cursor hover tracking inside the eye sandbox
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Limit maximum offset so pupil stays inside database iris
    const maxOffset = 22;
    const scale = distance > maxOffset ? maxOffset / distance : 1;

    setHoverOffset({
      x: dx * scale,
      y: dy * scale,
    });
  };

  const handleMouseLeave = () => {
    setHoverOffset(null);
  };

  // Calculate nearest preset on click within the eye container
  const handleSandboxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      onChange("center");
      return;
    }

    // Determine angle in degrees (clockwise)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // Check regions
    if (angle >= 337.5 || angle < 22.5) {
      onChange("right");
    } else if (angle >= 22.5 && angle < 67.5) {
      onChange("down-right");
    } else if (angle >= 67.5 && angle < 112.5) {
      onChange("down");
    } else if (angle >= 112.5 && angle < 157.5) {
      onChange("down-left");
    } else if (angle >= 157.5 && angle < 202.5) {
      onChange("left");
    } else if (angle >= 202.5 && angle < 247.5) {
      onChange("up-left");
    } else if (angle >= 247.5 && angle < 292.5) {
      onChange("up");
    } else {
      onChange("up-right");
    }
  };

  return (
    <div
      id="gaze-director-panel"
      className="rounded-3xl border-4 border-slate-950 bg-[#2a2929] p-5 shadow-[6px_6px_0px_#000] space-y-4"
    >
      {/* Title block */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
        <h3 className="font-sans font-black text-white text-base tracking-tight flex items-center space-x-2">
          <Eye className="w-5 h-5 text-cyan-300 stroke-[2.5]" />
          <span className="text-cyan-300">👁️ Eye Look-O-Matic</span>
        </h3>
        <span className="text-[10px] font-mono font-bold bg-[#1f1e1e] border-2 border-slate-950 px-2.5 py-0.5 rounded-full text-amber-300">
          MANUAL DIRECTION SETTER
        </span>
      </div>

      <p className="text-xs font-sans font-medium text-slate-300 leading-relaxed">
        Let's decide where your copycat character is looking! Hover and click inside/around the interactive eyes below, or pick a lookup candy button!
      </p>

      {/* Interactive Eye Sandbox */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleSandboxClick}
          className="group relative flex items-center justify-center p-6 bg-slate-950 border-4 border-slate-900 rounded-2xl cursor-crosshair select-none w-full max-w-[260px] h-[130px] overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]"
        >
          {/* Left Eye */}
          <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-slate-950 flex items-center justify-center relative overflow-hidden shadow-md">
            {/* Pupil */}
            <div
              className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center relative transition-transform duration-100 ease-out"
              style={getPupilTransform(value, true)}
            >
              {/* Blue iris highlight ring */}
              <div className="absolute inset-0.5 rounded-full bg-cyan-400/30 opacity-40"></div>
              {/* Glossy shine */}
              <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-white"></div>
            </div>
          </div>

          {/* Nose bridge */}
          <div className="w-4 h-9 bg-orange-400 rounded-full border-3 border-slate-950 -mx-1 z-10 shadow-[2px_2px_0px_#000]"></div>

          {/* Right Eye */}
          <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-slate-950 flex items-center justify-center relative overflow-hidden shadow-md">
            {/* Pupil */}
            <div
              className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center relative transition-transform duration-100 ease-out"
              style={getPupilTransform(value, false)}
            >
              {/* Blue iris highlight ring */}
              <div className="absolute inset-0.5 rounded-full bg-cyan-400/30 opacity-40"></div>
              {/* Glossy shine */}
              <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-white"></div>
            </div>
          </div>

          {/* Little drag hint label */}
          <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500 font-bold tracking-widest uppercase flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <Move className="w-2 h-2" />
            <span>Click/Drag Eyes</span>
          </div>
        </div>

        {/* Current Gaze Active Badge */}
        <div className="mt-3.5 px-4 py-1.5 bg-[#1f1e1e] border-2 border-slate-950 rounded-xl text-center shadow-[2px_2px_0px_#000] min-w-[200px]">
          <span className="text-xs font-sans font-black text-amber-300">
            {GAZE_DESCRIPTIONS[value].emoji} {GAZE_DESCRIPTIONS[value].label}
          </span>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 capitalize">
            "{GAZE_DESCRIPTIONS[value].text}"
          </p>
        </div>
      </div>

      {/* Grid of Preset Buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {(Object.keys(GAZE_DESCRIPTIONS) as GazeDirection[]).map((gaze) => {
          const isActive = value === gaze;
          return (
            <button
              key={gaze}
              onClick={() => onChange(gaze)}
              title={GAZE_DESCRIPTIONS[gaze].label}
              className={`p-2 rounded-xl border-2 text-xs transition-all duration-100 flex flex-col items-center justify-center cursor-pointer shadow-[2px_2px_0px_#000] relative ${
                isActive
                  ? "border-cyan-300 bg-slate-950 text-cyan-300 scale-102 translate-y-[1px] shadow-none"
                  : "border-slate-950 bg-[#1f1e1e] text-slate-400 hover:text-slate-100 hover:bg-[#252424]"
              }`}
            >
              <span className="text-base">{GAZE_DESCRIPTIONS[gaze].emoji}</span>
              <span className="text-[8px] font-semibold mt-1 uppercase text-center max-w-[45px] overflow-hidden truncate">
                {gaze === "cross" ? "Cross" : gaze}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

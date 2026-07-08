"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Upload, Download, ImageIcon, Settings2, Share2, ZoomIn, Copy, AlertCircle 
} from "lucide-react";
import { computeEdgeMap } from "@/lib/imageProcessing";

// --- PRESETS ---
const CHAR_PRESETS: Record<string, string> = {
  Standard: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  Blocks: "█▓▒░ ",
  Simple: "@%#*+=-:. ",
  Binary: "10",
  Dense: "Ñ@#W$9876543210?!abc;:+=-,._ ",
  Minimal: " .-:*",
  Retro: "o0Oo ",
  Symbols: "★☆♦♢♠♤♣♧ ",
  Custom: "",
};

const FONTS = [
  "Monospace",
  "Courier New",
  "Consolas",
  "Lucida Console",
  "Fira Code",
];

const PRESET_COLORS = [
  "#ffffff", "#000000", "#10b981", "#ef4444", "#3b82f6",
  "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
];

export default function ASCIIBinaryCreator() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href));
    }
  }, [status, router]);

  // State
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings: Sequences
  const [seqMode, setSeqMode] = useState<string>("Binary");
  const [customSeq, setCustomSeq] = useState<string>("10");

  // Settings: Typography
  const [fontFamily, setFontFamily] = useState<string>("Monospace");
  const [fontScale, setFontScale] = useState<number>(1.0); // 0.1x to 5.0x
  const [charSpacing, setCharSpacing] = useState<number>(1.0);
  const [lineHeight, setLineHeight] = useState<number>(1.0);

  // Settings: Image Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  
  // Settings: Effects
  const [blurStrength, setBlurStrength] = useState<number>(0);
  const [edgeDetect, setEdgeDetect] = useState<boolean>(true);
  const [edgeSensitivity, setEdgeSensitivity] = useState<number>(50); // 0-100
  const [invert, setInvert] = useState<boolean>(false);

  // Settings: Overlay
  const [overlayOriginal, setOverlayOriginal] = useState<boolean>(true);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(100);

  // Settings: Colors
  const [charColor, setCharColor] = useState<string>("#ffffff");
  const [bgColor, setBgColor] = useState<string>("transparent"); // "transparent" option checked implicitly

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImgObj(img);
      };
      img.src = url;
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const getCharList = useCallback(() => {
    if (seqMode === "Custom") return customSeq || " ";
    return CHAR_PRESETS[seqMode] || "10";
  }, [seqMode, customSeq]);

  // Main Render Logic
  const drawASCII = useCallback(() => {
    if (!imgObj || !canvasRef.current || !containerRef.current) return;
    
    // Attempt non-blocking frame queue
    requestAnimationFrame(() => {
      setIsProcessing(true);
      
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate base dimensions
      // Limit internal mapping resolution to max 1920 across to save CPU
      const ratio = imgObj.width / imgObj.height;
      let mapWidth = imgObj.width;
      let mapHeight = imgObj.height;
      const MAX_RES = 1600;
      if (mapWidth > MAX_RES) {
        mapWidth = MAX_RES;
        mapHeight = mapWidth / ratio;
      }

      // The overall Canvas dimensions MUST remain fixed to the image bounds 
      // preventing the image from stretching when text styling changes.
      canvas.width = mapWidth;
      canvas.height = mapHeight;

      const baseFontSize = 10;
      const fontSize = Math.max(2, baseFontSize * fontScale);
      
      const cellWidth = fontSize * charSpacing;
      const cellHeight = fontSize * lineHeight;

      const cols = Math.floor(mapWidth / cellWidth);
      const rows = Math.floor(mapHeight / cellHeight);

      // Clear / Background
      ctx.clearRect(0, 0, mapWidth, mapHeight);
      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, mapWidth, mapHeight);
      }

      // Draw overlay if required
      if (overlayOriginal) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blurStrength}px)`;
        ctx.globalAlpha = overlayOpacity / 100;
        ctx.drawImage(imgObj, 0, 0, mapWidth, mapHeight);
        ctx.globalAlpha = 1.0;
        ctx.filter = "none";
      }

      // --- PIXEL CAPTURE PASS ---
      // We draw the image to a hidden memory canvas to analyze pixels
      const memCanvas = document.createElement("canvas");
      memCanvas.width = cols;
      memCanvas.height = rows;
      const memCtx = memCanvas.getContext("2d");
      if (!memCtx) return;

      // Apply CSS-like filters before pixel read
      memCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blurStrength}px)`;
      memCtx.drawImage(imgObj, 0, 0, cols, rows);
      memCtx.filter = "none";

      const imgData = memCtx.getImageData(0, 0, cols, rows);
      
      // Compute Edge Map if enabled
      let edgeMap: Uint8Array | null = null;
      if (edgeDetect) {
        edgeMap = computeEdgeMap(imgData, edgeSensitivity);
      }

      // --- TEXT RENDERING PASS ---
      ctx.fillStyle = charColor;
      ctx.font = `${Math.floor(fontSize)}px "${fontFamily}", monospace`;
      ctx.textBaseline = "top";
      
      const charList = getCharList();
      const charLen = charList.length;
      
      // Convert to binary 0/1 array safely
      // "10" standard: charList[0] is '1', charList[1] is '0'.
      // Usually for generic ASCII, we map luminosity to index.
      const pixels = imgData.data;
      let seqIndex = 0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x);
          const pIdx = idx * 4;
          
          let charToDraw = "";

          // Luminosity of the pixel (0-255)
          const luma = 0.299 * pixels[pIdx] + 0.587 * pixels[pIdx + 1] + 0.114 * pixels[pIdx + 2];
          
          if (edgeMap) {
            // Binary Edge mode behavior
            const isEdge = edgeMap[idx] === 1;
            // Invert logic
            const resolvedEdge = invert ? !isEdge : isEdge;
            
            // Map Edge=True to sequence char, Empty=False to nothing (" ")
            if (resolvedEdge) {
              charToDraw = charList[seqIndex % charLen];
              seqIndex++;
            } else {
              charToDraw = " ";
            }
          } else {
            // Standard Luminosity Mapping behavior
            let norm = luma / 255; 
            if (invert) norm = 1 - norm;
            
            // Map to character index (darkest -> first char, lightest -> last char)
            const cIdx = Math.floor(norm * (charLen - 1));
            // Failsafe bounds
            const safeIdx = Math.max(0, Math.min(charLen - 1, cIdx));
            charToDraw = charList[safeIdx];
          }

          // Optimization: Skip empty spaces if they aren't meant to be drawn
          if (charToDraw !== " ") {
            const rx = x * cellWidth;
            const ry = y * cellHeight;
            ctx.fillText(charToDraw, rx, ry);
          }
        }
      }

      setIsProcessing(false);
    });
  }, [
    imgObj, seqMode, customSeq, fontFamily, fontScale, charSpacing, lineHeight,
    brightness, contrast, blurStrength, edgeDetect, edgeSensitivity, invert,
    overlayOriginal, overlayOpacity, charColor, bgColor, getCharList
  ]);

  // Debounced effect to call drawASCII when settings change
  useEffect(() => {
    const handler = setTimeout(() => {
      drawASCII();
    }, 150); // slight debounce for smooth dragging
    return () => clearTimeout(handler);
  }, [drawASCII]);

  // Exporters
  const exportPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "creator_output.png";
    a.click();
  };

  const generateTXTString = () => {
    // This repeats the basic generation loop but builds a text string
    if (!imgObj) return "";
    
    const ratio = imgObj.width / imgObj.height;
    let mapWidth = imgObj.width;
    let mapHeight = imgObj.height;
    const MAX_RES = 1600;
    if (mapWidth > MAX_RES) {
      mapWidth = MAX_RES;
      mapHeight = mapWidth / ratio;
    }
    const baseFontSize = 10;
    const fontSize = Math.max(2, baseFontSize * fontScale);
    
    const cellWidth = fontSize * charSpacing;
    const cellHeight = fontSize * lineHeight;

    const cols = Math.floor(mapWidth / cellWidth);
    const rows = Math.floor(mapHeight / cellHeight);

    const memCanvas = document.createElement("canvas");
    memCanvas.width = cols;
    memCanvas.height = rows;
    const memCtx = memCanvas.getContext("2d");
    if (!memCtx) return "";

    memCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blurStrength}px)`;
    memCtx.drawImage(imgObj, 0, 0, cols, rows);
    const imgData = memCtx.getImageData(0, 0, cols, rows);
    const pixels = imgData.data;

    let edgeMap: Uint8Array | null = null;
    if (edgeDetect) {
      edgeMap = computeEdgeMap(imgData, edgeSensitivity);
    }
    const charList = getCharList();
    const charLen = charList.length;

    let txt = "";
    let seqIndex = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x);
        const luma = 0.299 * pixels[idx*4] + 0.587 * pixels[idx*4+1] + 0.114 * pixels[idx*4+2];
        let charToDraw = " ";
        
        if (edgeMap) {
          const isEdge = edgeMap[idx] === 1;
          const resolvedEdge = invert ? !isEdge : isEdge;
          if (resolvedEdge) {
            charToDraw = charList[seqIndex % charLen];
            seqIndex++;
          } else {
            charToDraw = " ";
          }
        } else {
          let norm = luma / 255; 
          if (invert) norm = 1 - norm;
          const cIdx = Math.floor(norm * (charLen - 1));
          charToDraw = charList[Math.max(0, Math.min(charLen - 1, cIdx))];
        }
        txt += charToDraw;
      }
      txt += "\n";
    }
    return txt;
  };

  const exportTXT = () => {
    const txt = generateTXTString();
    if (!txt) return;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creator_output.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const txt = generateTXTString();
    if (!txt) return;
    navigator.clipboard.writeText(txt).then(() => alert("Copied to clipboard!"));
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#121212] flex-col gap-4">
        <SpinnerIcon className="h-8 w-8 text-indigo-400 animate-spin" />
        <p className="text-white text-sm font-bold tracking-widest uppercase">Authenticating Workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#121212] font-sans text-sm">
      {/* LEFT PANEL */}
      <div className="w-[340px] shrink-0 border-r border-[#2a2a2a] bg-[#1a1a1a] flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Header Options */}
        <div className="p-5 border-b border-[#2a2a2a] sticky top-0 bg-[#1a1a1a]/95 backdrop-blur z-10">
          <h2 className="text-xl font-black text-white tracking-widest uppercase mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> ASCII Kit
          </h2>
          <div className="flex gap-2">
            {!imgObj ? (
              <div {...getRootProps()} className="w-full flex-1">
                <input {...getInputProps()} />
                <button className="w-full py-2.5 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-medium flex items-center justify-center gap-2 transition-colors">
                  <Upload className="h-4 w-4" /> Upload Image
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setImgObj(null)} className="flex-1 py-2.5 rounded-lg border border-[#3a3a3a] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#2a2a2a]">
                  Clear
                </button>
                <div className="group relative flex-1">
                  <button className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> Export
                  </button>
                  {/* Export dropdown */}
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] rounded-lg shadow-xl overflow-hidden hidden group-hover:block border border-[#3a3a3a]">
                    <button onClick={exportPNG} className="w-full text-left px-4 py-2 hover:bg-[#3a3a3a] text-white">Export PNG</button>
                    <button onClick={exportTXT} className="w-full text-left px-4 py-2 hover:bg-[#3a3a3a] text-white">Export TXT</button>
                    <button onClick={copyToClipboard} className="w-full text-left px-4 py-2 hover:bg-[#3a3a3a] text-white">Copy to Clipboard</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="p-5 space-y-8">

          {/* Sequences */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider"># Character Sequence</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(CHAR_PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => setSeqMode(key)}
                  className={`py-2 px-3 text-xs rounded transition-colors ${seqMode === key ? 'bg-indigo-600 text-white font-bold' : 'bg-[#2a2a2a] text-[#aaa] hover:bg-[#3a3a3a]'}`}
                >
                  {key}
                </button>
              ))}
            </div>
            {seqMode === "Custom" && (
              <input 
                type="text" 
                value={customSeq} 
                onChange={e => setCustomSeq(e.target.value)} 
                placeholder="Enter characters..."
                className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider">T Font Family</h3>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map(f => (
                <button
                  key={f}
                  onClick={() => setFontFamily(f)}
                  className={`py-2 px-2 text-xs truncate rounded transition-colors ${fontFamily === f ? 'bg-[#333] border border-slate-500 text-white' : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:bg-[#2a2a2a]'}`}
                >
                  {f.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-xs text-[#aaa]">
                <span>Font Scale</span>
                <span>{fontScale.toFixed(2)}x</span>
              </div>
              <input type="range" min="0.2" max="3" step="0.1" value={fontScale} onChange={e => setFontScale(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#aaa]">
                <span>Char Spacing</span>
                <span>{charSpacing.toFixed(1)}</span>
              </div>
              <input type="range" min="0.5" max="2" step="0.1" value={charSpacing} onChange={e => setCharSpacing(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#aaa]">
                <span>Line Height</span>
                <span>{lineHeight.toFixed(1)}</span>
              </div>
              <input type="range" min="0.5" max="2" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>

          {/* Image Tweaks */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider">✧ Image Adjustments</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#aaa]">
                <span>Brightness</span>
                <span>{brightness}%</span>
              </div>
              <input type="range" min="0" max="200" step="5" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="w-full accent-indigo-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#aaa]">
                <span>Contrast</span>
                <span>{contrast}%</span>
              </div>
              <input type="range" min="0" max="300" step="5" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>

          {/* Processing */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider">↯ Processing</h3>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" id="invertCh" checked={invert} onChange={e => setInvert(e.target.checked)} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
              <label htmlFor="invertCh" className="text-sm text-[#eee] cursor-pointer cursor-user-select-none">Invert Matrix</label>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#aaa]">
                <span>Blur Pre-filter</span>
                <span>{blurStrength}px</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={blurStrength} onChange={e => setBlurStrength(parseInt(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div className="pt-2 border-t border-[#2a2a2a]">
              <div className="flex items-center justify-between mt-2">
                <label className="text-sm text-[#eee]">Edge Detection</label>
                <button onClick={() => setEdgeDetect(!edgeDetect)} className={`px-3 py-1 rounded text-xs font-bold ${edgeDetect ? 'bg-emerald-600 text-white' : 'bg-[#333] text-[#aaa]'}`}>
                  {edgeDetect ? 'Enable' : 'Off'}
                </button>
              </div>
              {edgeDetect && (
                <div className="space-y-1 mt-3 transition-all">
                  <div className="flex justify-between text-xs text-[#aaa]">
                    <span>Edge Sensitivity</span>
                    <span>{edgeSensitivity}</span>
                  </div>
                  <input type="range" min="1" max="100" value={edgeSensitivity} onChange={e => setEdgeSensitivity(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider">▣ Color Scheme</h3>
             <div>
               <p className="text-xs text-[#aaa] mb-2">Character Color</p>
               <div className="flex flex-wrap gap-2">
                 {PRESET_COLORS.map(c => (
                   <button key={c} onClick={() => setCharColor(c)} className={`w-6 h-6 rounded-full border-2 ${charColor===c ? 'border-indigo-500 scale-110' : 'border-transparent'} transition-transform`} style={{ backgroundColor: c }} />
                 ))}
               </div>
             </div>
             
             <div>
               <div className="flex items-center justify-between mb-2">
                 <p className="text-xs text-[#aaa]">Background Color</p>
                 <button onClick={() => setBgColor("transparent")} className={`text-xs px-2 py-0.5 rounded ${bgColor==="transparent"? 'bg-indigo-600 text-white' : 'bg-[#333] text-[#aaa]'}`}>Transparent</button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {PRESET_COLORS.map(c => (
                   <button key={c} onClick={() => setBgColor(c)} className={`w-6 h-6 rounded-full border-2 ${bgColor===c ? 'border-indigo-500 scale-110' : 'border-transparent'} transition-transform`} style={{ backgroundColor: c }} />
                 ))}
               </div>
             </div>
          </div>

          {/* Overlay */}
          <div className="space-y-4 pb-10">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider">▤ Overlay Original</h3>
            <div className="flex items-center justify-between mt-2">
              <label className="text-sm text-[#eee]">Blend Mode</label>
              <button onClick={() => setOverlayOriginal(!overlayOriginal)} className={`px-3 py-1 rounded text-xs font-bold ${overlayOriginal ? 'bg-emerald-600 text-white' : 'bg-[#333] text-[#aaa]'}`}>
                {overlayOriginal ? 'Enable' : 'Off'}
              </button>
            </div>
            {overlayOriginal && (
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-xs text-[#aaa]">
                  <span>Opacity</span>
                  <span>{overlayOpacity}%</span>
                </div>
                <input type="range" min="0" max="100" value={overlayOpacity} onChange={e => setOverlayOpacity(parseInt(e.target.value))} className="w-full accent-indigo-500" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT PANEL CAANVAS */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#0a0a0a] relative overflow-auto custom-scrollbar flex items-center justify-center p-8"
        style={{
          backgroundImage: bgColor === "transparent" ? `url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="rgba(255,255,255,0.05)"/><rect x="10" y="10" width="10" height="10" fill="rgba(255,255,255,0.05)"/></svg>')` : 'none',
        }}
      >
        {!imgObj ? (
          <div {...getRootProps()} className="flex flex-col items-center justify-center text-[#555] text-center max-w-sm cursor-pointer hover:scale-105 transition-transform duration-300">
            <input {...getInputProps()} />
            <div className="w-24 h-24 rounded-3xl bg-[#1a1a1a] flex items-center justify-center mb-6 shadow-2xl">
               <ImageIcon className="h-10 w-10 text-[#444]" />
            </div>
            <h3 className="text-xl font-bold text-[#ccc] mb-2">Workspace Zero</h3>
            <p className="text-sm text-[#777] leading-relaxed">
              Upload an image to start rendering your ASCII binary matrix.
            </p>
          </div>
        ) : (
          <div className="relative inline-block max-w-[100%] max-h-[100%] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <canvas
              ref={canvasRef}
              className="block bg-transparent max-w-full max-h-full object-contain"
              style={{
                imageRendering: "pixelated",
              }}
            />
            {isProcessing && (
              <div className="absolute top-4 right-4 bg-[#1a1a1a]/80 backdrop-blur border border-[#333] px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-emerald-400">
                <SpinnerIcon className="animate-spin h-3 w-3" />
                Rendering
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

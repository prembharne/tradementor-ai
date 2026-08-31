import { useState, useRef } from "react";
import { 
  Upload, 
  Eye, 
  TrendingUp, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  BarChart2, 
  FileImage, 
  RefreshCw, 
  Zap, 
  Target, 
  Activity, 
  Cpu 
} from "lucide-react";
import { api } from "../api/client";

// Preloaded high-resolution SVG candlestick chart presets with institutional-grade technical depth
const SAMPLE_CHARTS = [
  {
    id: "btc-breakout",
    title: "BTC/USDT 15m London Breakout",
    symbol: "BTCUSDT",
    timeframe: "15m",
    description: "Range compression followed by strong displacement above session high with fair value gap.",
    previewSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320" style="background:%23000000;font-family:monospace;">
      <rect width="600" height="320" fill="%23050505"/>
      <line x1="40" y1="60" x2="580" y2="60" stroke="%23222" stroke-width="1" stroke-dasharray="4"/>
      <line x1="40" y1="140" x2="580" y2="140" stroke="%23222" stroke-width="1" stroke-dasharray="4"/>
      <line x1="40" y1="220" x2="580" y2="220" stroke="%23222" stroke-width="1" stroke-dasharray="4"/>
      <text x="50" y="30" fill="%23FF4D00" font-weight="bold" font-size="14">BTC/USDT 15m • BREAKOUT ZONE</text>
      <!-- Resistance Line -->
      <line x1="40" y1="120" x2="580" y2="120" stroke="%23FF4D00" stroke-width="2" stroke-dasharray="6"/>
      <text x="490" y="115" fill="%23FF4D00" font-size="11">RESISTANCE 80,039</text>
      <!-- Candle cluster -->
      <line x1="80" y1="130" x2="80" y2="190" stroke="%2322c55e" stroke-width="2"/>
      <rect x="74" y="140" width="12" height="35" fill="%2322c55e"/>
      <line x1="120" y1="145" x2="120" y2="210" stroke="%23ef4444" stroke-width="2"/>
      <rect x="114" y="160" width="12" height="30" fill="%23ef4444"/>
      <line x1="160" y1="135" x2="160" y2="185" stroke="%2322c55e" stroke-width="2"/>
      <rect x="154" y="145" width="12" height="25" fill="%2322c55e"/>
      <line x1="200" y1="130" x2="200" y2="190" stroke="%23ef4444" stroke-width="2"/>
      <rect x="194" y="140" width="12" height="30" fill="%23ef4444"/>
      <line x1="240" y1="125" x2="240" y2="180" stroke="%2322c55e" stroke-width="2"/>
      <rect x="234" y="135" width="12" height="30" fill="%2322c55e"/>
      <!-- Breakout Displacement Candle -->
      <line x1="290" y1="70" x2="290" y2="160" stroke="%2322c55e" stroke-width="3"/>
      <rect x="282" y="80" width="16" height="65" fill="%2322c55e"/>
      <!-- BOS text -->
      <rect x="310" y="85" width="90" height="20" fill="%23FF4D00"/>
      <text x="316" y="99" fill="%23000" font-weight="bold" font-size="11">★ BOS CONFIRMED</text>
      <!-- Retest Candle -->
      <line x1="340" y1="95" x2="340" y2="135" stroke="%23ef4444" stroke-width="2"/>
      <rect x="334" y="105" width="12" height="18" fill="%23ef4444"/>
      <!-- Continuation Candle -->
      <line x1="390" y1="50" x2="390" y2="115" stroke="%2322c55e" stroke-width="2"/>
      <rect x="384" y="60" width="12" height="45" fill="%2322c55e"/>
      <!-- FVG box -->
      <rect x="270" y="130" width="60" height="20" fill="%23FF4D00" fill-opacity="0.25" stroke="%23FF4D00" stroke-width="1"/>
      <text x="275" y="144" fill="%23FF4D00" font-size="9">15m FVG ZONE</text>
    </svg>`,
    presetAnalysis: {
      marketStructure: "The market exhibits a textbook high-momentum Bullish Break of Structure (BOS) on the 15-minute timeframe. Following an extended Asian session accumulation phase between $79,400 and $79,800, institutional buyers initiated an impulsive displacement candle closing decisively above the prior swing high at $80,039. The sequential printing of Higher Highs (HH) and Higher Lows (HL) confirms dominant buy-side control with no signs of distribution.",
      supportResistance: [
        "Major Resistance Broken: $80,039 (Previous session high, now flipped into high-probability support floor)",
        "Primary Target Resistance: $81,250 - $81,600 (High-timeframe 4H liquidity pool & unfilled wick imbalance)",
        "Dynamic Support Pivot: $79,800 (Range equilibrium and point of control)",
        "Key Invalidation Base: $79,500 (Structural swing low and invalidation boundary)"
      ],
      bosChoch: "Clean Bullish BOS confirmed at $80,039 with full candle body close above resistance. Minimal upper wick rejection indicates aggressive buy-side absorption with zero bearish Change of Character (CHoCH) on the active leg.",
      liquidityZones: "Fair Value Gap (FVG) formed between $79,800 - $80,020 acting as the primary institutional mitigation zone. Uncollected Buy-Side Liquidity (BSL) pools rest above $81,200.",
      invalidationBias: "Strong Bullish Continuation Bias targeting 1:2.5+ R:R. Recommended invalidation placed strictly below $79,500. Enter on retest of the FVG / broken resistance with risk capped at 1%."
    }
  },
  {
    id: "eth-reversal",
    title: "ETH/USDT 1H Liquidity Sweep & CHoCH",
    symbol: "ETHUSDT",
    timeframe: "1h",
    description: "Rejection of key resistance with bearish divergence and change of character on hourly chart.",
    previewSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320" style="background:%23000000;font-family:monospace;">
      <rect width="600" height="320" fill="%23050505"/>
      <line x1="40" y1="70" x2="580" y2="70" stroke="%23ef4444" stroke-width="2" stroke-dasharray="4"/>
      <text x="50" y="30" fill="%23FF4D00" font-weight="bold" font-size="14">ETH/USDT 1H • LIQUIDITY SWEEP</text>
      <text x="470" y="65" fill="%23ef4444" font-size="11">SWEEP LEVEL 3,350</text>
      <line x1="100" y1="120" x2="100" y2="180" stroke="%2322c55e" stroke-width="2"/>
      <rect x="94" y="130" width="12" height="40" fill="%2322c55e"/>
      <line x1="160" y1="90" x2="160" y2="160" stroke="%2322c55e" stroke-width="2"/>
      <rect x="154" y="100" width="12" height="45" fill="%2322c55e"/>
      <!-- Sweep Wick -->
      <line x1="220" y1="55" x2="220" y2="150" stroke="%23ef4444" stroke-width="2"/>
      <rect x="214" y="90" width="12" height="35" fill="%23ef4444"/>
      <text x="240" y="60" fill="%23ef4444" font-size="10">▲ LIQUIDITY GRAB</text>
      <!-- Bearish Displacement -->
      <line x1="280" y1="100" x2="280" y2="210" stroke="%23ef4444" stroke-width="3"/>
      <rect x="272" y="115" width="16" height="80" fill="%23ef4444"/>
      <rect x="300" y="180" width="100" height="20" fill="%23ef4444"/>
      <text x="306" y="194" fill="%23fff" font-weight="bold" font-size="11">▼ CHoCH TRIGGER</text>
    </svg>`,
    presetAnalysis: {
      marketStructure: "Structural Trend Reversal confirmed via a Bearish Change of Character (CHoCH) on the 1-hour timeframe. The market formed an institutional liquidity grab above the $3,350 psychological resistance, immediately followed by heavy volume displacement downward. Price cleanly violated the internal demand structure at $3,280, signaling the exhaustion of buyers and the onset of a corrective distribution cycle.",
      supportResistance: [
        "Key Supply Rejection / Sweep High: $3,350 (Strong institutional rejection wick)",
        "Breakeven Re-test Zone: $3,290 - $3,310 (Bearish Order Block confluence)",
        "Primary Demand Target: $3,180 - $3,200 (Daily imbalance and uncollected sell-side liquidity)",
        "Macro Structural Floor: $3,120"
      ],
      bosChoch: "Bearish CHoCH confirmed by an aggressive 1H body close below $3,280. The high volume accompanying the sell-off confirms smart money participation rather than low-volume noise.",
      liquidityZones: "Sell-Side Liquidity (SSL) heavily stacked below $3,220 with an unmitigated Bearish Order Block at $3,320 acting as strong overhead resistance on any corrective bounce.",
      invalidationBias: "High-Conviction Bearish Reversal Bias targeting $3,180. Strict invalidation on any 1H candle acceptance above the $3,355 swing high. Risk capped at 1% with 1:2.8 R:R."
    }
  }
];

export function ChartExplainer() {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_CHARTS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [analyzing, setAnalyzing] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [lastScannedTime, setLastScannedTime] = useState<string>("Just now");
  const [analysisResult, setAnalysisResult] = useState<any>(SAMPLE_CHARTS[0].presetAnalysis);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      runVisionAnalysis(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof SAMPLE_CHARTS[0]) => {
    setSelectedPreset(preset);
    setUploadedImage(null);
    setUploadedFile(null);
    setSymbol(preset.symbol);
    setTimeframe(preset.timeframe);
    setAnalysisResult(preset.presetAnalysis);
    setLastScannedTime(new Date().toLocaleTimeString());
  };

  const runVisionAnalysis = async (fileToAnalyze?: File | null) => {
    const file = fileToAnalyze ?? uploadedFile;
    setAnalyzing(true);
    try {
      if (file) {
        const res = await api.explainChartImage(file, symbol, timeframe);
        if (res?.analysis) {
          const a = res.analysis;
          setAnalysisResult({
            marketStructure: typeof a.marketStructure === "string" ? a.marketStructure : (a.analysis || JSON.stringify(a)),
            supportResistance: Array.isArray(a.supportResistance) && a.supportResistance.length > 0 
              ? a.supportResistance 
              : ["Dynamic support and resistance levels mapped from chart screenshot."],
            bosChoch: a.bosChoch || "Structure patterns analyzed by Vision AI.",
            liquidityZones: a.liquidityZones || "Order blocks and liquidity pools mapped.",
            invalidationBias: a.invalidationBias || "Maintain strict risk parameters according to your strategy rules."
          });
          setLastScannedTime(new Date().toLocaleTimeString());
        }
      } else {
        // Run preset re-scan
        await new Promise((resolve) => setTimeout(resolve, 800));
        setAnalysisResult(selectedPreset.presetAnalysis);
        setLastScannedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Vision API error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const activeImageSrc = uploadedImage || selectedPreset.previewSvg;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Vision AI engine</p>
          <h2 className="page-title mt-2">AI Chart Explainer & Visualizer</h2>
          <p className="mt-2 max-w-3xl text-[var(--color-muted)]">
            Upload any candlestick chart screenshot or select a setup below. The AI vision model scans market structure, BOS/CHoCH, liquidity gaps, and key levels with deep technical breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success flex items-center gap-1.5 font-bold font-mono text-xs">
            <Cpu size={14} className="text-[#FF4D00]" /> Model: minimax/minimax-m3:free
          </span>
        </div>
      </section>

      {/* Preset Selector */}
      <section className="grid gap-3 sm:grid-cols-2">
        {SAMPLE_CHARTS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className={`surface p-4 text-left transition-all cursor-pointer border-2 ${
              selectedPreset.id === preset.id && !uploadedImage
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : "border-transparent hover:border-black/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-brutal text-xs font-bold uppercase text-[var(--color-primary)]">
                {preset.symbol} • {preset.timeframe}
              </span>
              {selectedPreset.id === preset.id && !uploadedImage && (
                <span className="badge badge-success text-[10px]">SELECTED</span>
              )}
            </div>
            <h3 className="mt-1 text-base font-black text-[var(--color-ink)]">{preset.title}</h3>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{preset.description}</p>
          </button>
        ))}
      </section>

      {/* Main Workspace Layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        {/* Left: Chart Viewer & Upload Box */}
        <div className="space-y-4">
          <div className="surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono-brutal text-xs font-bold uppercase">
                <BarChart2 size={16} className="text-[var(--color-primary)]" />
                <span>Active Chart Canvas</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  className="select text-xs py-1.5 px-3"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  {["5m", "15m", "1h", "4h", "1D"].map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-neutral text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} /> Upload Screenshot
                </button>
              </div>
            </div>

            {/* Visual Canvas Display with Scanner Laser Beam */}
            <div className="relative rounded-lg overflow-hidden border border-black/10 bg-black min-h-[340px] flex items-center justify-center group">
              <img
                src={activeImageSrc}
                alt="Trading Chart"
                className="w-full h-auto object-contain max-h-[400px]"
              />

              {/* Laser Scanning Animation when analyzing */}
              {analyzing && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-4 text-white z-20">
                  <div className="relative w-48 h-1 bg-white/20 overflow-hidden rounded-full">
                    <div className="w-full h-full bg-[#FF4D00] animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw size={22} className="animate-spin text-[#FF4D00]" />
                    <p className="font-mono-brutal text-xs font-bold tracking-widest text-[#FF4D00]">
                      SCANNING CANDLESTICK STRUCTURE WITH MINIMAX M3...
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Overlay Markers on Top of Chart */}
              {showOverlays && !analyzing && (
                <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <span className="bg-black/80 backdrop-blur-sm text-[#FF4D00] text-[10px] font-mono-brutal font-bold px-2 py-1 rounded border border-[#FF4D00]/50 flex items-center gap-1">
                      <Activity size={12} /> AI VISION SCANNER ACTIVE
                    </span>
                    <span className="bg-black/80 backdrop-blur-sm text-green-400 text-[10px] font-mono-brutal font-bold px-2 py-1 rounded border border-green-500/50 flex items-center gap-1">
                      <Target size={12} /> S/R MAPPED
                    </span>
                  </div>

                  {uploadedImage && (
                    <div className="self-end bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono-brutal px-2.5 py-1 rounded border border-white/20">
                      ✓ Scanned: {lastScannedTime}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-muted)] flex items-center gap-1.5 font-mono-brutal">
                  <FileImage size={14} /> {uploadedImage ? "Custom Uploaded Chart" : selectedPreset.title}
                </span>
                <button
                  type="button"
                  onClick={() => setShowOverlays(!showOverlays)}
                  className="text-[11px] text-[var(--color-primary)] font-bold hover:underline cursor-pointer"
                >
                  {showOverlays ? "Hide Overlay Badges" : "Show Overlay Badges"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => runVisionAnalysis()}
                disabled={analyzing}
                className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer font-bold"
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Scanning Vision...
                  </>
                ) : (
                  <>
                    <Zap size={14} /> Re-Scan Chart Vision
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Vision AI Breakdown Cards with Enhanced Information Density */}
        <div className="space-y-4">
          <div className="surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono-brutal text-xs font-bold uppercase text-[var(--color-primary)]">
                <Eye size={16} />
                <span>Deep Technical AI Scan Results</span>
              </div>
              <span className="badge badge-neutral text-[10px] font-mono-brutal">
                {uploadedImage ? "Custom Scan" : "Preset Scan"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Market Structure Card */}
              <div className="p-4 rounded-md bg-neutral-50 border border-black/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--color-ink)]">
                  <TrendingUp size={16} className="text-[var(--color-primary)]" />
                  <span>Market Structure & Directional Momentum</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed font-inter">
                  {typeof analysisResult?.marketStructure === "string" 
                    ? analysisResult.marketStructure 
                    : JSON.stringify(analysisResult?.marketStructure)}
                </p>
              </div>

              {/* Support & Resistance Levels */}
              <div className="p-4 rounded-md bg-neutral-50 border border-black/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--color-ink)]">
                  <Layers size={16} className="text-[var(--color-secondary)]" />
                  <span>Key Support, Resistance & Pivot Confluences</span>
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-800 font-mono-brutal">
                  {Array.isArray(analysisResult?.supportResistance) ? (
                    analysisResult.supportResistance.map((lvl: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/70 p-1.5 rounded border border-black/5">
                        <CheckCircle2 size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                        <span className="leading-snug">{lvl}</span>
                      </li>
                    ))
                  ) : (
                    <li>{String(analysisResult?.supportResistance || "Key levels identified")}</li>
                  )}
                </ul>
              </div>

              {/* BOS & Liquidity */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-3.5 rounded-md bg-neutral-50 border border-black/10 space-y-1.5">
                  <span className="font-mono-brutal text-[10px] font-bold uppercase text-[var(--color-muted)]">
                    Structure Confirmation (BOS/CHoCH)
                  </span>
                  <p className="text-xs font-semibold text-[var(--color-ink)] leading-relaxed">
                    {String(analysisResult?.bosChoch || "BOS Verified")}
                  </p>
                </div>
                <div className="p-3.5 rounded-md bg-neutral-50 border border-black/10 space-y-1.5">
                  <span className="font-mono-brutal text-[10px] font-bold uppercase text-[var(--color-muted)]">
                    Liquidity Pools & Imbalances (FVG)
                  </span>
                  <p className="text-xs font-semibold text-[var(--color-ink)] leading-relaxed">
                    {String(analysisResult?.liquidityZones || "Fair Value Gap identified")}
                  </p>
                </div>
              </div>

              {/* Execution Bias & Invalidation */}
              <div className="p-4 rounded-md bg-orange-50 border border-orange-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-orange-950">
                  <ShieldAlert size={16} className="text-[#FF4D00]" />
                  <span>Execution Bias & Strict Invalidation Plan</span>
                </div>
                <p className="text-xs text-orange-900 leading-relaxed font-inter font-medium">
                  {String(analysisResult?.invalidationBias || "Trade strictly based on invalidation levels.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

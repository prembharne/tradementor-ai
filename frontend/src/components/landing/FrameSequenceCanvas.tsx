// @refresh reset
import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { useMotionValueEvent } from "framer-motion";
import type { ObservatoryManifest } from "../../data/landingChapters";
import { FrameSequenceLoader, type FrameSource } from "./FrameSequenceLoader";

type FrameSequenceCanvasProps = {
  progress: MotionValue<number>;
  manifest: ObservatoryManifest;
  reducedMotion: boolean;
};

function useMobileSource() {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 700px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

export function FrameSequenceCanvas({ progress, manifest, reducedMotion }: FrameSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<FrameSequenceLoader | null>(null);
  const frameRef = useRef(0);
  const lastReadyRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef(0);
  const [failed, setFailed] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const mobile = useMobileSource();
  const source: FrameSource = mobile ? manifest.mobile : manifest.desktop;
  const poster = mobile ? manifest.posters.mobile : manifest.posters.desktop;

  const draw = useCallback((image: CanvasImageSource) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const bounds = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.75);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const context = canvas.getContext("2d");
      if (!context) return;
      const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth : source.width;
      const imageHeight = image instanceof HTMLImageElement ? image.naturalHeight : source.height;
      const scale = Math.max(width / imageWidth, height / imageHeight);
      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    });
  }, [mobile, source.height, source.width]);

  const requestFrame = (index: number, direction: number) => {
    const loader = loaderRef.current;
    if (!loader || reducedMotion || failed) return;
    const cached = loader.get(index);
    if (cached) {
      lastReadyRef.current = cached;
      draw(cached);
    } else if (lastReadyRef.current) {
      draw(lastReadyRef.current);
    }

    void loader
      .load(index)
      .then((image) => {
        if (frameRef.current === index) {
          lastReadyRef.current = image;
          draw(image);
        }
      })
      .catch(() => {
        if (!lastReadyRef.current) setFailed(true);
      });

    const radius = mobile ? 5 : 9;
    const nearby: number[] = [];
    for (let offset = 1; offset <= radius; offset += 1) {
      const ahead = index + offset * direction;
      const behind = index - offset * direction;
      if (ahead >= 0 && ahead < manifest.frameCount) nearby.push(ahead);
      if (behind >= 0 && behind < manifest.frameCount) nearby.push(behind);
    }
    loader.preload(nearby);
  };

  useMotionValueEvent(progress, "change", (value) => {
    if (reducedMotion) return;
    const index = Math.round(Math.min(1, Math.max(0, value)) * (manifest.frameCount - 1));
    if (index === frameRef.current && lastReadyRef.current) return;
    const direction = index >= frameRef.current ? 1 : -1;
    frameRef.current = index;
    requestFrame(index, direction);
  });

  useEffect(() => {
    setFailed(false);
    setPrepared(false);
    frameRef.current = 0;
    lastReadyRef.current = null;
    if (reducedMotion) return;

    const loader = new FrameSequenceLoader(source, mobile ? 18 : 30, mobile ? 3 : 5);
    loaderRef.current = loader;
    loader.preload([manifest.frameCount - 1]);
    void loader
      .load(0)
      .then((image) => {
        lastReadyRef.current = image;
        draw(image);
        setPrepared(true);
        loader.preload(Array.from({ length: mobile ? 5 : 9 }, (_, index) => index + 1));
      })
      .catch(() => setFailed(true));

    const observer = new ResizeObserver(() => {
      if (lastReadyRef.current) draw(lastReadyRef.current);
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      loader.dispose();
      loaderRef.current = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw, manifest.frameCount, mobile, reducedMotion, source]);

  return (
    <div ref={containerRef} className="obs-sequence" aria-hidden="true">
      <picture className="obs-poster">
        <source media="(max-width: 700px)" srcSet={manifest.posters.mobile} />
        <img src={poster} alt="" />
      </picture>
      {!reducedMotion && !failed && <canvas ref={canvasRef} className={prepared ? "is-ready" : ""} />}
      {!prepared && !failed && !reducedMotion && (
        <div className="obs-loading"><span /> Preparing sequence</div>
      )}
      {failed && <div className="obs-loading obs-fallback">Static observatory view</div>}
    </div>
  );
}

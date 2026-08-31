export type FrameSource = {
  path: string;
  width: number;
  height: number;
};

export function frameUrl(source: FrameSource, index: number) {
  return source.path.replace("{frame}", String(index + 1).padStart(4, "0"));
}

export class FrameSequenceLoader {
  private cache = new Map<number, HTMLImageElement>();
  private pending = new Map<number, Promise<HTMLImageElement>>();
  private queue: Array<{ index: number; resolve: (image: HTMLImageElement) => void; reject: () => void }> = [];
  private active = 0;
  private disposed = false;
  private source: FrameSource;
  private maxCache: number;
  private concurrency: number;

  constructor(source: FrameSource, maxCache: number, concurrency = 4) {
    this.source = source;
    this.maxCache = maxCache;
    this.concurrency = concurrency;
  }

  get(index: number) {
    const image = this.cache.get(index);
    if (image) {
      this.cache.delete(index);
      this.cache.set(index, image);
    }
    return image;
  }

  load(index: number) {
    const cached = this.get(index);
    if (cached) return Promise.resolve(cached);
    const pending = this.pending.get(index);
    if (pending) return pending;

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      this.queue.push({ index, resolve, reject: () => reject(new Error(`Frame ${index} failed`)) });
      this.pump();
    });
    this.pending.set(index, promise);
    return promise;
  }

  preload(indices: number[]) {
    indices.forEach((index) => void this.load(index).catch(() => undefined));
  }

  dispose() {
    this.disposed = true;
    this.queue = [];
    this.pending.clear();
    this.cache.clear();
  }

  private pump() {
    while (!this.disposed && this.active < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) return;
      this.active += 1;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (!this.disposed) {
          this.cache.set(item.index, image);
          this.evict(item.index);
          item.resolve(image);
        }
        this.finish(item.index);
      };
      image.onerror = () => {
        item.reject();
        this.finish(item.index);
      };
      image.src = frameUrl(this.source, item.index);
    }
  }

  private finish(index: number) {
    this.active -= 1;
    this.pending.delete(index);
    this.pump();
  }

  private evict(activeIndex: number) {
    while (this.cache.size > this.maxCache) {
      let candidate: number | undefined;
      let distance = -1;
      for (const index of this.cache.keys()) {
        const nextDistance = Math.abs(index - activeIndex);
        if (nextDistance > distance) {
          candidate = index;
          distance = nextDistance;
        }
      }
      if (candidate === undefined) return;
      this.cache.delete(candidate);
    }
  }
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

const FRAME_SIZE = 280; // px — diameter of the circular crop frame

export const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when a new image is loaded
  useEffect(() => {
    if (!imageUrl || !open) return;
    setIsLoading(true);
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      // Fit the smaller dimension to fill the frame
      const scale = Math.max(FRAME_SIZE / img.naturalWidth, FRAME_SIZE / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      setImageSize({ w, h });
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl, open]);

  // Clamp offset so image never leaves the circular frame
  const clampOffset = useCallback(
    (ox: number, oy: number, currentZoom: number) => {
      const scaledW = imageSize.w * currentZoom;
      const scaledH = imageSize.h * currentZoom;
      const maxX = Math.max(0, (scaledW - FRAME_SIZE) / 2);
      const maxY = Math.max(0, (scaledH - FRAME_SIZE) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, ox)),
        y: Math.min(maxY, Math.max(-maxY, oy)),
      };
    },
    [imageSize]
  );

  // Draw onto canvas for preview
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || isLoading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = FRAME_SIZE;
    canvas.height = FRAME_SIZE;

    const scaledW = imageSize.w * zoom;
    const scaledH = imageSize.h * zoom;

    const drawX = (FRAME_SIZE - scaledW) / 2 + offset.x;
    const drawY = (FRAME_SIZE - scaledH) / 2 + offset.y;

    ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
    ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
  }, [zoom, offset, imageSize, isLoading]);

  // --- Mouse / Touch drag handlers ---
  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const rawX = e.clientX - dragStart.x;
    const rawY = e.clientY - dragStart.y;
    setOffset(clampOffset(rawX, rawY, zoom));
  };

  const onPointerUp = () => setIsDragging(false);

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0];
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
  };

  // --- Export cropped image ---
  const handleApply = useCallback(async () => {
    const img = imageRef.current;
    if (!img) return;

    const outputSize = 512;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = outputSize;
    exportCanvas.height = outputSize;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Apply circular clip on export canvas
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const ratio = outputSize / FRAME_SIZE;
    const scaledW = imageSize.w * zoom * ratio;
    const scaledH = imageSize.h * zoom * ratio;
    const drawX = (outputSize - scaledW) / 2 + offset.x * ratio;
    const drawY = (outputSize - scaledH) / 2 + offset.y * ratio;

    ctx.drawImage(img, drawX, drawY, scaledW, scaledH);

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
          onOpenChange(false);
        }
      },
      'image/jpeg',
      0.95
    );
  }, [imageSize, zoom, offset, onCropComplete, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Circular frame */}
          <div className="flex justify-center">
            <div
              className="relative overflow-hidden rounded-full border-4 border-primary shadow-lg"
              style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
            >
              {isLoading ? (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  width={FRAME_SIZE}
                  height={FRAME_SIZE}
                  className="cursor-grab active:cursor-grabbing"
                  style={{ touchAction: 'none', userSelect: 'none' }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                />
              )}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Drag to reposition · Use the slider to zoom
          </p>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-1">
            <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={handleZoomChange}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isLoading} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

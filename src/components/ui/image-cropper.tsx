import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  // Reset crop when image changes
  useEffect(() => {
    if (imageUrl) {
      setCrop({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
      setCompletedCrop(undefined);
    }
  }, [imageUrl]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const handleCrop = async () => {
    const croppedBlob = await getCroppedImg();
    if (croppedBlob) {
      onCropComplete(croppedBlob);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="max-h-[400px] overflow-hidden rounded-lg border">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              minWidth={50}
              minHeight={50}
              keepSelection
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-w-full h-auto block"
                style={{ maxHeight: '400px' }}
              />
            </ReactCrop>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Drag to adjust the crop area. The image will be cropped to a perfect circle.
          </p>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCrop}
              disabled={!completedCrop}
              className="flex-1"
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
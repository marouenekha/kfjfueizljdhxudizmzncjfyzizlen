import { useState, useRef } from "react";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface PortfolioUploadProps {
  onUpload: (files: File[]) => void;
}

export function PortfolioUpload({ onUpload }: PortfolioUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image or video file`);
      }
      return isValid;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    onUpload(selectedFiles);
    setSelectedFiles([]);
    setIsOpen(false);
    toast.success(`Uploaded ${selectedFiles.length} file(s) to portfolio`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-background/90 backdrop-blur rounded-full w-8 h-8 p-0 z-10"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Portfolio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop images or videos here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, MP4, MOV files
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square bg-muted rounded overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={getFilePreview(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-xs text-center px-1">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 rounded-full"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button 
            onClick={handleUpload} 
            disabled={selectedFiles.length === 0}
            className="w-full"
          >
            Upload to Portfolio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
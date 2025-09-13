import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, Image, Music, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadAreaProps {
  onFileUpload: (files: File[], type: 'powerpoint' | 'images' | 'audio' | 'document') => void;
  isProcessing: boolean;
}

export const FileUploadArea = ({ onFileUpload, isProcessing }: FileUploadAreaProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const powerpointRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Determine file type based on extension
    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pptx') {
      onFileUpload([file], 'powerpoint');
    } else if (['docx', 'doc'].includes(extension || '')) {
      onFileUpload([file], 'document');
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      onFileUpload(files, 'images');
    } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(extension || '')) {
      onFileUpload([file], 'audio');
    }
  };

  const handleFileSelect = (type: 'powerpoint' | 'images' | 'audio' | 'document') => {
    const input = type === 'powerpoint' ? powerpointRef.current 
                 : type === 'images' ? imageRef.current 
                 : type === 'audio' ? audioRef.current
                 : documentRef.current;
                 
    input?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'powerpoint' | 'images' | 'audio' | 'document') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files, type);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragOver ? "border-accent bg-accent/5" : "border-muted-foreground/25",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">Drop files here</p>
          <p className="text-xs text-muted-foreground text-center">
            Word (.docx), PowerPoint (.pptx), Images (jpg, png, gif), Audio (mp3, wav, m4a)
          </p>
        </CardContent>
      </Card>

      {/* File Type Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          onClick={() => handleFileSelect('document')}
          disabled={isProcessing}
          className="w-full justify-start gap-2 h-auto p-3"
        >
          <FileText className="h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">Word Document Outline</div>
            <div className="text-xs text-muted-foreground">.docx files for AI slide generation</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleFileSelect('powerpoint')}
          disabled={isProcessing}
          className="w-full justify-start gap-2 h-auto p-3"
        >
          <File className="h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">PowerPoint File</div>
            <div className="text-xs text-muted-foreground">.pptx files</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleFileSelect('images')}
          disabled={isProcessing}
          className="w-full justify-start gap-2 h-auto p-3"
        >
          <Image className="h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">Image Files</div>
            <div className="text-xs text-muted-foreground">jpg, png, gif, webp</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleFileSelect('audio')}
          disabled={isProcessing}
          className="w-full justify-start gap-2 h-auto p-3"
        >
          <Music className="h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">Audio File</div>
            <div className="text-xs text-muted-foreground">mp3, wav, m4a, aac</div>
          </div>
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={documentRef}
        type="file"
        accept=".docx,.doc"
        onChange={(e) => handleInputChange(e, 'document')}
        className="hidden"
      />
      <input
        ref={powerpointRef}
        type="file"
        accept=".pptx"
        onChange={(e) => handleInputChange(e, 'powerpoint')}
        className="hidden"
      />
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleInputChange(e, 'images')}
        className="hidden"
      />
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleInputChange(e, 'audio')}
        className="hidden"
      />

      {/* Processing Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing files...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* File Format Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Supported Formats:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
            <li><strong>Word Documents:</strong> .docx files for AI slide generation (max 100MB)</li>
            <li><strong>PowerPoint:</strong> .pptx files (Office 2007+) (max 100MB)</li>
            <li><strong>Images:</strong> .jpg, .png, .gif, .webp (max 100MB each)</li>
            <li><strong>Audio:</strong> .mp3, .wav, .m4a, .aac (max 100MB)</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
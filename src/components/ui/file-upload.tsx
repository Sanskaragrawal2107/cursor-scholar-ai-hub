import { useState, useRef } from 'react';
import { Button } from './button';
import { Upload, X, FileText, Check } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  buttonText?: string;
  initialFileName?: string;
}

export function FileUpload({
  onFileChange,
  accept = "application/pdf",
  maxSize = 5, // default 5MB
  className = "",
  buttonText = "Upload File",
  initialFileName = ""
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>(initialFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      setFileName("");
      onFileChange(null);
      return;
    }

    // Check file type if accept is specified
    if (accept && !accept.split(',').some(type => {
      type = type.trim();
      if (type.startsWith('.')) {
        // Handle extension check
        return selectedFile.name.toLowerCase().endsWith(type.toLowerCase());
      }
      // Handle mime type check
      return selectedFile.type === type || selectedFile.type.startsWith(type.split('/')[0] + '/');
    })) {
      setError(`Please select a valid file type (${accept})`);
      e.target.value = '';
      return;
    }

    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    onFileChange(selectedFile);
  };

  const handleClear = () => {
    setFile(null);
    setFileName("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileChange(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept={accept}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {!file && !fileName && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClick} 
            className="w-full h-24 border-dashed flex flex-col gap-1 items-center justify-center"
          >
            <Upload className="h-5 w-5" />
            <span>{buttonText}</span>
            <span className="text-xs text-gray-500">Max size: {maxSize}MB</span>
          </Button>
        )}

        {(file || fileName) && (
          <div className="flex items-center justify-between bg-muted p-3 rounded-md">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="max-w-xs truncate">{file ? file.name : fileName}</div>
              {file && <Check className="h-4 w-4 text-green-500" />}
            </div>
            <Button type="button" size="icon" variant="ghost" onClick={handleClear}>
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
} 
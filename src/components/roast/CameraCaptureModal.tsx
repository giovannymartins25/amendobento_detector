import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Zap, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flash, setFlash] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setErrorMsg(null);
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        currentStream = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        console.warn('Erro ao acessar a câmera:', err);
        setErrorMsg('Não foi possível acessar a câmera do dispositivo. Verifique as permissões.');
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleTakeSnap = () => {
    if (!videoRef.current) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onCapture(dataUrl);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          onCapture(base64);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-fade-in">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">CÂMERA INDUSTRIAL</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleCamera}
            className="p-2.5 bg-industrial-card border border-industrial-border rounded-xl text-white hover:bg-industrial-cardHover transition-colors"
            title="Alternar Câmera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-industrial-card border border-industrial-border rounded-xl text-white hover:bg-industrial-cardHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div className="relative flex-1 my-4 bg-industrial-card border border-industrial-border rounded-3xl overflow-hidden flex items-center justify-center">
        {flash && <div className="absolute inset-0 bg-white z-20 animate-pulse" />}

        {errorMsg ? (
          <div className="p-6 text-center space-y-4 max-w-sm">
            <Zap className="w-12 h-12 text-amber-400 mx-auto" />
            <p className="text-sm text-industrial-textSecondary">{errorMsg}</p>
            <label className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-industrial-accent text-white font-bold rounded-xl cursor-pointer">
              <Upload className="w-5 h-5" />
              Selecionar Foto do Dispositivo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Shutter Action (Thumb Zone Ergonomics) */}
      <div className="flex items-center justify-around py-4 z-10">
        <label className="p-4 bg-industrial-card border border-industrial-border rounded-2xl text-industrial-textSecondary hover:text-white cursor-pointer active:scale-95 transition-all">
          <Upload className="w-6 h-6" />
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        {/* Huge Shutter Button */}
        <button
          onClick={handleTakeSnap}
          disabled={!!errorMsg}
          className="w-20 h-20 rounded-full bg-white border-4 border-emerald-500 shadow-success-glow flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <Camera className="w-8 h-8" />
          </div>
        </button>

        <div className="w-14" /> {/* Spacer for balance */}
      </div>

    </div>
  );
};

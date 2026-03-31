"use client";

import { useState, useRef, useCallback } from "react";
import { FaCamera, FaTimes, FaRedo, FaCheck } from "react-icons/fa";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async (facing: "environment" | "user" = facingMode) => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
      setCapturedImage(null);
      setError(null);
    } catch {
      setError("Unable to access camera. Please check permissions or try uploading instead.");
      setIsStreaming(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const acceptPhoto = useCallback(() => {
    if (!capturedImage) return;

    // Convert data URL to File
    const byteString = atob(capturedImage.split(",")[1]);
    const mimeType = "image/jpeg";
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: mimeType });

    onCapture(file);
    stopCamera();
    onClose();
  }, [capturedImage, onCapture, stopCamera, onClose]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const switchCamera = useCallback(() => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    if (isStreaming) {
      startCamera(newFacing);
    }
  }, [facingMode, isStreaming, startCamera]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <h3 className="text-white font-semibold text-sm">Take Photo</h3>
        <button
          onClick={handleClose}
          className="text-white/80 hover:text-white p-2"
          aria-label="Close camera"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Camera / Preview area */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {error && (
          <div className="text-center p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => startCamera()}
              className="px-4 py-2 bg-[#C9A84C] text-white rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!isStreaming && !capturedImage && !error && (
          <div className="text-center p-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
              <FaCamera className="text-3xl text-[#C9A84C]" />
            </div>
            <p className="text-white/80 mb-4">Take a photo of your coin or item</p>
            <button
              onClick={() => startCamera()}
              className="px-6 py-3 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg font-semibold transition-colors"
            >
              Open Camera
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          className={`max-w-full max-h-full object-contain ${isStreaming ? "" : "hidden"}`}
          playsInline
          muted
          autoPlay
        />

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-black/80 px-4 py-4">
        {isStreaming && (
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={switchCamera}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              aria-label="Switch camera"
            >
              <FaRedo className="text-lg" />
            </button>
            <button
              onClick={takePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-[#C9A84C] hover:border-[#b8963e] flex items-center justify-center transition-colors"
              aria-label="Take photo"
            >
              <div className="w-12 h-12 rounded-full bg-[#C9A84C]" />
            </button>
            <div className="w-12 h-12" /> {/* Spacer for alignment */}
          </div>
        )}

        {capturedImage && (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={retake}
              className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors"
            >
              <FaRedo />
              Retake
            </button>
            <button
              onClick={acceptPhoto}
              className="flex items-center gap-2 px-5 py-3 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg font-semibold transition-colors"
            >
              <FaCheck />
              Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, type ChangeEvent, type MutableRefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { socketService } from '@/services/socketService';
import type { CanvasShape } from '@/store/boardStore';
import type { AccessMode } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

type UseBoardActionsArgs = {
  roomId: string;
  user: { id: string } | null | undefined;
  isReadOnly: boolean;
  boardName: string;
  dimensions: { width: number; height: number };
  stagePos: { x: number; y: number };
  stageScale: number;
  stageRef: MutableRefObject<any>;
  addShape: (shape: CanvasShape) => void;
  accessMode: AccessMode;
  setAccessMode: (mode: AccessMode) => void;
};

export function useBoardActions({
  roomId,
  user,
  isReadOnly,
  boardName,
  dimensions,
  stagePos,
  stageScale,
  stageRef,
  addShape,
  accessMode,
  setAccessMode,
}: UseBoardActionsArgs) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleAccessChange = async (mode: AccessMode) => {
    setAccessMode(mode);
    const isPublic = mode !== 'RESTRICTED';
    const allowEdits = mode === 'EDIT';

    try {
      await fetch(`${BACKEND_URL}/api/v1/room/${roomId}/visibility`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic, allowEdits }),
      });
    } catch {
      console.error('Failed to update access');
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isReadOnly) return;
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'syncspace');

      const res = await fetch('https://api.cloudinary.com/v1_1/dnyynbwea/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload failed');

      const originalWidth = data.width;
      const originalHeight = data.height;

      const newImageShape: CanvasShape = {
        id: uuidv4(),
        type: 'image',
        url: data.secure_url,
        x: (window.innerWidth / 2 - originalWidth / 2 - stagePos.x) / stageScale,
        y: (window.innerHeight / 2 - originalHeight / 2 - stagePos.y) / stageScale,
        width: originalWidth,
        height: originalHeight,
        stroke: 'transparent',
        strokeWidth: 0,
      };

      addShape(newImageShape);
      if (socketService.socket && user) {
        socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: newImageShape });
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleExportPNG = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${boardName}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportPDF = () => {
    if (stageRef.current) {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/jpeg', quality: 0.8 });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [dimensions.width, dimensions.height] });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, dimensions.width, dimensions.height);
      pdf.save(`${boardName}.pdf`);
    }
  };

  return {
    accessMode,
    showShareModal,
    copySuccess,
    isUploadingImage,
    openShareModal: () => setShowShareModal(true),
    closeShareModal: () => setShowShareModal(false),
    handleAccessChange,
    handleImageUpload,
    handleCopyLink,
    handleExportPNG,
    handleExportPDF,
  };
}

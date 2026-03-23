import { useEffect, useState } from 'react';
import { socketService } from '@/services/socketService';

type UseCanvasHotkeysArgs = {
  roomId: string;
  isReadOnly: boolean;
  selectedShapeIds: string[];
  deleteShapes: (ids: string[]) => void;
  setSelectedShapeIds: (ids: string[]) => void;
};

export function useCanvasHotkeys({ roomId, isReadOnly, selectedShapeIds, deleteShapes, setSelectedShapeIds }: UseCanvasHotkeysArgs) {
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof Element && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

      if (e.code === 'Space') setIsSpacePressed(true);

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isReadOnly && selectedShapeIds.length > 0) {
        deleteShapes(selectedShapeIds);
        if (socketService.socket) socketService.socket.emit('delete-shapes', { roomId, shapeIds: selectedShapeIds });
        setSelectedShapeIds([]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedShapeIds, deleteShapes, roomId, isReadOnly, setSelectedShapeIds]);

  return { isSpacePressed };
}

import { useEffect } from 'react';
import { socketService } from '@/services/socketService';
import { useBoardStore, CanvasShape } from '@/store/boardStore';
import type { AccessMode, RemoteCursor } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

type UseBoardSessionArgs = {
  roomId: string;
  user: { id: string } | null | undefined;
  addShape: (shape: CanvasShape) => void;
  clearBoard: () => void;
  deleteShapes: (ids: string[]) => void;
  setIsReadOnly: (readOnly: boolean) => void;
  setIsMounted: (value: boolean) => void;
  setDimensions: (value: { width: number; height: number }) => void;
  setRemoteShapes: React.Dispatch<React.SetStateAction<{ [userId: string]: CanvasShape }>>;
  setRemoteCursors: React.Dispatch<React.SetStateAction<Record<string, RemoteCursor>>>;
  setIsOwner: (value: boolean) => void;
  setAccessMode: (value: AccessMode) => void;
  setBoardName: (value: string) => void;
  lastSavedState: React.MutableRefObject<string>;
};

export function useBoardSession({
  roomId,
  user,
  addShape,
  clearBoard,
  deleteShapes,
  setIsReadOnly,
  setIsMounted,
  setDimensions,
  setRemoteShapes,
  setRemoteCursors,
  setIsOwner,
  setAccessMode,
  setBoardName,
  lastSavedState,
}: UseBoardSessionArgs) {
  useEffect(() => {
    if (!user) return;

    setIsMounted(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    const initBoard = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/room/${roomId}`, { method: 'GET', credentials: 'include' });

        if (response.ok) {
          const result = await response.json();
          const incomingData = result.room?.data || result.data || [];
          const incomingName = result.room?.name || 'Untitled Board';

          const isUserOwner = result.room?.ownerId === user.id;
          setIsOwner(isUserOwner);

          if (!result.room?.isPublic) setAccessMode('RESTRICTED');
          else if (result.room?.allowEdits) setAccessMode('EDIT');
          else setAccessMode('VIEW');

          const readOnly = !isUserOwner && !result.room?.allowEdits;
          setIsReadOnly(readOnly);
          if (readOnly) useBoardStore.getState().setActiveTool('select');

          useBoardStore.getState().setInitialShapes(incomingData);
          setBoardName(incomingName);
          lastSavedState.current = JSON.stringify(incomingData);
        } else if (response.status === 403) {
          alert('This board is restricted.');
          window.location.href = '/dashboard';
        }
      } catch (err) {
        console.error('🔴 [Canvas] Failed to load initial board state:', err);
      }
    };

    initBoard();

    const socket = socketService.connect(roomId, user.id);
    socket?.on('draw-stream-update', (data) => setRemoteShapes((prev) => ({ ...prev, [data.userId]: data.shape })));
    socket?.on('draw-update', (data) => {
      if (data.action === 'add') {
        addShape(data.shape);
        setRemoteShapes((prev) => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }
    });
    socket?.on('sync-full-state', (newShapes) => useBoardStore.getState().forceReplaceBoard(newShapes));
    socket?.on('shape-updated', (updatedShape) => useBoardStore.getState().updateShape(updatedShape.id, updatedShape));
    socket?.on('cursor-update', (data) => {
      setRemoteCursors((prev) => ({ ...prev, [data.userId]: { x: data.x, y: data.y, name: data.name, color: data.color } }));
    });
    socket?.on('user-left', (data) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
    });
    socket?.on('board-cleared', () => clearBoard());
    socket?.on('shapes-deleted', (deletedIds: string[]) => deleteShapes(deletedIds));

    return () => {
      window.removeEventListener('resize', handleResize);
      socketService.disconnect(roomId, user.id);
      socket?.off('draw-stream-update');
      socket?.off('draw-update');
      socket?.off('sync-full-state');
      socket?.off('shape-updated');
      socket?.off('cursor-update');
      socket?.off('user-left');
      socket?.off('board-cleared');
      socket?.off('shapes-deleted');
    };
  }, [roomId, user, addShape, clearBoard, deleteShapes, setIsReadOnly, setIsMounted, setDimensions, setRemoteShapes, setRemoteCursors, setIsOwner, setAccessMode, setBoardName, lastSavedState]);
}

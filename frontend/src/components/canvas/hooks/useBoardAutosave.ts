import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useBoardStore } from '@/store/boardStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

type UseBoardAutosaveArgs = {
  roomId: string;
  user: { id: string } | null | undefined;
  isReadOnly: boolean;
  boardName: string;
  stageRef: React.MutableRefObject<any>;
  lastSavedState: React.MutableRefObject<string>;
};

export function useBoardAutosave({ roomId, user, isReadOnly, boardName, stageRef, lastSavedState }: UseBoardAutosaveArgs) {
  const stackUser = useUser({ or: 'redirect' });
  
  useEffect(() => {
    if (!user || isReadOnly) return;

    const saveInterval = setInterval(async () => {
      const currentShapes = useBoardStore.getState().shapes;
      const currentStringified = JSON.stringify(currentShapes);

      if (currentStringified !== lastSavedState.current || lastSavedState.current === 'FORCE_SAVE') {
        const thumbnailDataUrl = stageRef.current
          ? stageRef.current.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg', quality: 0.5 })
          : null;

        try {
          const token = await stackUser.getAccessToken();
          const response = await fetch(`${BACKEND_URL}/api/v1/room/${roomId}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ shapes: currentShapes, name: boardName, thumbnail: thumbnailDataUrl }),
          });

          if (response.ok) lastSavedState.current = currentStringified;
        } catch (err) {
          console.error('🔴 [Debouncer] Network failure during save:', err);
        }
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [roomId, user, boardName, isReadOnly, stageRef, lastSavedState]);
}

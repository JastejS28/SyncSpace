'use client';

import CanvasBoard from '@/components/CanvasBoard';
import Toolbar from '@/components/Toolbar';
import { useParams } from 'next/navigation';

export default function BoardPage() {
  const params = useParams();
  const roomId = params.id as string;

  return (
    <main className="relative w-full h-screen">
      
      
      {/* Pass the roomId explicitly */}
      <Toolbar roomId={roomId} />
      <CanvasBoard roomId={roomId} />
    </main>
  );
}
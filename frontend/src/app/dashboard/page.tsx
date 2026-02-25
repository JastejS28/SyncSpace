'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Plus, LayoutDashboard, Clock, Trash2 } from 'lucide-react';

interface RoomData {
  id: string;
  name: string;
  updatedAt: string;
  thumbnail: string | null;
}

export default function DashboardPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const initializeDashboard = async () => {
      try {
        await fetch('http://localhost:8080/api/v1/user/sync', { // CHECK YOUR PORT
          method: 'POST',
          credentials: 'include'
        });

        const response = await fetch('http://localhost:8080/api/v1/room', { // CHECK YOUR PORT
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setRooms(data.rooms || []);
        }
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [user]);

  const handleCreateBoard = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/room', { // CHECK YOUR PORT
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/board/${data.room.id}`);
      } else {
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Network error creating board:", error);
      setIsCreating(false);
    }
  };

  // --- NEW: Delete Handler ---
  const handleDeleteBoard = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation(); // Prevents the card's onClick from firing and taking you to the board

    const confirmed = window.confirm("Are you sure you want to permanently delete this board?");
    if (!confirmed) return;

    // Optimistic UI Update: Remove it from the screen immediately so it feels fast
    setRooms(prev => prev.filter(r => r.id !== roomId));

    try {
      const response = await fetch(`http://localhost:8080/api/v1/room/${roomId}`, { // CHECK YOUR PORT
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Deletion failed on server");
      }
    } catch (err) {
      console.error("Failed to delete board:", err);
      // If the server fails, force a page reload to resync the true database state
      window.location.reload(); 
    }
  };

  if (isLoading || !user) return <div className="h-screen w-full flex items-center justify-center">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="text-blue-600" />
              My Workspace
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, {user.displayName || user.primaryEmail}</p>
          </div>
          <button 
            onClick={handleCreateBoard}
            disabled={isCreating}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            {isCreating ? 'Creating...' : 'New Board'}
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500 mb-4">You don't have any boards yet.</p>
            <button onClick={handleCreateBoard} className="text-blue-600 font-semibold hover:underline">Create your first board</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <div 
                key={room.id} 
                onClick={() => router.push(`/board/${room.id}`)}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
              >
                
                {/* --- NEW: Delete Button --- */}
                <button 
                  onClick={(e) => handleDeleteBoard(e, room.id)}
                  className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Delete Board"
                >
                  <Trash2 size={16} />
                </button>

                <div className="w-full h-32 rounded-lg mb-4 flex items-center justify-center overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-blue-300 transition-colors">
                  {room.thumbnail ? (
                    <img src={room.thumbnail} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <LayoutDashboard className="text-gray-300 group-hover:text-blue-300" size={40} />
                  )}
                </div>
                
                <h3 className="font-bold text-lg truncate pr-8">{room.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                  <Clock size={12} /> 
                  Updated {new Date(room.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
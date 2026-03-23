'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Plus, LayoutDashboard, Clock3, Trash2, FolderKanban, CalendarClock, LogOut, UserRound, Home, BarChart3, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RoomData {
  id: string;
  name: string;
  updatedAt: string;
  thumbnail: string | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function DashboardPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) return;

    const initializeDashboard = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/v1/user/sync`, {
          method: 'POST',
          credentials: 'include',
        });

        const response = await fetch(`${BACKEND_URL}/api/v1/room`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setRooms(data.rooms || []);
        }
      } catch (error) {
        console.error('Dashboard initialization failed:', error);
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
      const response = await fetch(`${BACKEND_URL}/api/v1/room`, {
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
      console.error('Network error creating board:', error);
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();

    const confirmed = window.confirm('Are you sure you want to permanently delete this board?');
    if (!confirmed) return;

    setRooms((prev) => prev.filter((r) => r.id !== roomId));

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/room/${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Deletion failed on server');
    } catch (err) {
      console.error('Failed to delete board:', err);
      window.location.reload();
    }
  };

  const greeting = useMemo(() => {
    if (!user) return 'Welcome back';
    return user.displayName || user.primaryEmail || 'Welcome back';
  }, [user]);

  const updatedToday = useMemo(() => {
    const today = new Date().toDateString();
    return rooms.filter((room) => new Date(room.updatedAt).toDateString() === today).length;
  }, [rooms]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const stackUser = user as any;
      if (typeof stackUser?.signOut === 'function') {
        await stackUser.signOut();
        router.push('/');
        router.refresh();
        return;
      }

      window.location.href = '/handler/sign-out';
    } catch (error) {
      console.error('Logout failed, redirecting to sign-out handler:', error);
      window.location.href = '/handler/sign-out';
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 text-sm text-slate-600 shadow-sm'>
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <main className='min-h-screen' style={{ background: 'hsl(216, 89%, 86%)' }}>
      {!isSidebarOpen && (
        <Button
          type='button'
          onClick={() => setIsSidebarOpen(true)}
          size='icon'
          variant='secondary'
          className='fixed left-4 top-4 z-50 border border-blue-200 bg-white/95 text-blue-900 shadow-md hover:bg-white'
          title='Open sidebar'
        >
          <PanelLeftOpen size={18} />
        </Button>
      )}

      {isSidebarOpen && (
        <button
          type='button'
          aria-label='Close sidebar overlay'
          onClick={() => setIsSidebarOpen(false)}
          className='fixed inset-0 z-30 bg-blue-950/20 md:hidden'
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-blue-200/70 bg-white/90 backdrop-blur transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='border-b border-blue-100 px-5 py-4'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700'>
                <UserRound size={18} />
              </div>
              <div>
                <p className='text-sm font-semibold text-blue-950'>SyncSpace Workspace</p>
                <p className='text-xs text-blue-900/65'>Dashboard Console</p>
              </div>
            </div>
            <Button
              type='button'
              size='icon'
              variant='ghost'
              className='text-blue-900 hover:bg-blue-100/80'
              onClick={() => setIsSidebarOpen(false)}
              title='Close sidebar'
            >
              <PanelLeftClose size={18} />
            </Button>
          </div>
          <div className='rounded-xl border border-blue-100 bg-blue-50/60 p-3'>
            <p className='truncate text-sm font-semibold text-blue-950'>{greeting}</p>
            <p className='truncate text-xs text-blue-900/70'>{user.primaryEmail}</p>
          </div>
        </div>

        <nav className='flex-1 space-y-1 px-3 py-4'>
          <button className='flex w-full items-center gap-3 rounded-lg bg-blue-100/80 px-3 py-2 text-left text-sm font-medium text-blue-900'>
            <Home size={16} /> Home
          </button>
          <button className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-blue-900/80 transition-colors hover:bg-blue-100/70'>
            <FolderKanban size={16} /> Boards
          </button>
          <button className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-blue-900/80 transition-colors hover:bg-blue-100/70'>
            <BarChart3 size={16} /> Analytics
          </button>
          <button className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-blue-900/80 transition-colors hover:bg-blue-100/70'>
            <Settings size={16} /> Settings
          </button>
        </nav>

        <div className='space-y-3 border-t border-blue-100 p-4'>
          <Button onClick={handleCreateBoard} disabled={isCreating} className='w-full'>
            <Plus size={16} />
            {isCreating ? 'Creating...' : 'Create New Board'}
          </Button>
          <Button onClick={handleLogout} disabled={isLoggingOut} variant='secondary' className='w-full text-red-600 hover:text-red-700'>
            <LogOut size={16} />
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
      </aside>

      <section className={`px-4 py-6 transition-[margin] duration-300 md:px-8 md:py-8 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-0'}`}>
        <div className='mx-auto max-w-6xl space-y-6'>
          <Card className='overflow-hidden border-blue-200/90 bg-white/95'>
            <CardHeader className='pb-4'>
              <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                  <CardTitle className='text-3xl tracking-tight text-blue-950'>My Workspace</CardTitle>
                  <CardDescription className='mt-1 text-sm text-blue-900/70'>
                    {greeting}
                  </CardDescription>
                </div>
                <Button onClick={handleCreateBoard} disabled={isCreating} size='lg'>
                  <Plus size={18} />
                  {isCreating ? 'Creating...' : 'Create New Board'}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='border-blue-200/90 bg-white/95'>
              <CardContent className='flex items-center gap-3 p-5'>
                <div className='rounded-lg bg-blue-100 p-2 text-blue-700'>
                  <FolderKanban size={18} />
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-blue-900/60'>Total Boards</p>
                  <p className='text-2xl font-semibold text-blue-950'>{rooms.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className='border-blue-200/90 bg-white/95'>
              <CardContent className='flex items-center gap-3 p-5'>
                <div className='rounded-lg bg-blue-100 p-2 text-blue-700'>
                  <CalendarClock size={18} />
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-blue-900/60'>Updated Today</p>
                  <p className='text-2xl font-semibold text-blue-950'>{updatedToday}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {rooms.length === 0 ? (
            <Card className='border-dashed border-blue-300/80 bg-white/95'>
              <CardContent className='py-20 text-center'>
                <LayoutDashboard className='mx-auto mb-4 text-blue-300' size={42} />
                <p className='text-blue-900/75'>You do not have any boards yet.</p>
                <Button onClick={handleCreateBoard} variant='secondary' className='mt-4'>
                  Create your first board
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  onClick={() => router.push(`/board/${room.id}`)}
                  className='group cursor-pointer border-blue-200/90 bg-white/95 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-200/50'
                >
                  <CardContent className='p-4'>
                    <div className='relative'>
                      <button
                        onClick={(e) => handleDeleteBoard(e, room.id)}
                        className='absolute right-2 top-2 z-10 rounded-lg border border-transparent bg-white/90 p-1.5 text-blue-400 opacity-0 shadow-sm transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100'
                        title='Delete Board'
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className='mb-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-blue-200 bg-blue-50'>
                        {room.thumbnail ? (
                          <img src={room.thumbnail} alt={room.name} className='h-full w-full object-cover' />
                        ) : (
                          <LayoutDashboard className='text-blue-300 group-hover:text-blue-500' size={42} />
                        )}
                      </div>
                    </div>

                    <h3 className='truncate pr-8 text-base font-semibold text-blue-950'>{room.name}</h3>
                    <p className='mt-2 flex items-center gap-1.5 text-xs text-blue-900/65'>
                      <Clock3 size={12} />
                      Updated {new Date(room.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className='border-blue-200/90 bg-white/95'>
            <CardContent className='flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between'>
              <p className='text-sm text-blue-900/75'>Tip: Keep naming boards by sprint or feature for cleaner collaboration.</p>
              <Button onClick={handleCreateBoard} disabled={isCreating} variant='secondary'>
                <Plus size={16} />
                {isCreating ? 'Creating...' : 'Create New Board'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

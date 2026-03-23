'use client';

import { useBoardStore, ToolType } from '@/store/boardStore';
import { MousePointer2, Pencil, Square, Circle, Type, Undo, Redo, Bold, Italic, Underline, Trash2 } from 'lucide-react';
import { socketService } from '@/services/socketService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Toolbar({ roomId }: { roomId: string }) {
  const {
    activeTool,
    setActiveTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    fontSize,
    setFontSize,
    isBold,
    toggleBold,
    isItalic,
    toggleItalic,
    isUnderline,
    toggleUnderline,
    undo,
    redo,
    history,
    historyStep,
    isReadOnly,
    clearBoard,
  } = useBoardStore();

  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select' },
    { id: 'pen', icon: <Pencil size={18} />, label: 'Pen' },
    { id: 'rectangle', icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
    { id: 'text', icon: <Type size={18} />, label: 'Text' },
  ];

  const colors = ['#0f172a', '#ef4444', '#2563eb', '#16a34a', '#eab308', '#a855f7'];

  const handleUndo = () => {
    undo();
    const pastState = useBoardStore.getState().shapes;
    socketService.socket?.emit('force-state-sync', { roomId, shapes: pastState });
  };

  const handleRedo = () => {
    redo();
    const futureState = useBoardStore.getState().shapes;
    socketService.socket?.emit('force-state-sync', { roomId, shapes: futureState });
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to completely clear the board? This cannot be undone.')) {
      clearBoard();
      socketService.socket?.emit('clear-board', { roomId });
    }
  };

  if (isReadOnly) return null;

  return (
    <div className='absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3'>
      <Card className='w-[74px] p-2 backdrop-blur-sm'>
        <div className='flex flex-col gap-1'>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                'flex h-10 w-full items-center justify-center rounded-lg border text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700',
                activeTool === tool.id
                  ? 'border-blue-200 bg-blue-100/80 text-blue-700 shadow-sm'
                  : 'border-transparent bg-transparent'
              )}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </Card>

      <Card className='w-[180px] p-3 backdrop-blur-sm'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Color</p>
          <div className='flex flex-wrap gap-2'>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition-all',
                  strokeColor === color ? 'scale-110 border-slate-900' : 'border-white'
                )}
                style={{ backgroundColor: color }}
                title={`Use ${color}`}
              />
            ))}
          </div>
        </div>

        {activeTool !== 'text' ? (
          <div className='mt-4'>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Stroke</p>
              <span className='text-xs font-medium text-slate-500'>{strokeWidth}px</span>
            </div>
            <input
              type='range'
              min='1'
              max='10'
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className='w-full cursor-pointer accent-blue-600'
            />
          </div>
        ) : (
          <div className='mt-4 border-t border-slate-200 pt-3'>
            <div className='mb-3'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Font Size</p>
                <span className='text-xs font-medium text-slate-500'>{fontSize}</span>
              </div>
              <input
                type='range'
                min='12'
                max='72'
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className='w-full cursor-pointer accent-blue-600'
              />
            </div>

            <div className='grid grid-cols-3 gap-1'>
              <button
                onClick={toggleBold}
                className={cn(
                  'flex h-9 items-center justify-center rounded-lg border text-slate-600 transition-colors',
                  isBold ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                )}
                title='Bold'
              >
                <Bold size={14} />
              </button>
              <button
                onClick={toggleItalic}
                className={cn(
                  'flex h-9 items-center justify-center rounded-lg border text-slate-600 transition-colors',
                  isItalic ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                )}
                title='Italic'
              >
                <Italic size={14} />
              </button>
              <button
                onClick={toggleUnderline}
                className={cn(
                  'flex h-9 items-center justify-center rounded-lg border text-slate-600 transition-colors',
                  isUnderline ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                )}
                title='Underline'
              >
                <Underline size={14} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card className='w-[180px] p-2 backdrop-blur-sm'>
        <div className='flex items-center gap-1'>
          <Button onClick={handleUndo} disabled={historyStep === 0} variant='ghost' size='icon' title='Undo'>
            <Undo size={17} />
          </Button>
          <Button onClick={handleRedo} disabled={historyStep === history.length - 1} variant='ghost' size='icon' title='Redo'>
            <Redo size={17} />
          </Button>
          <Button onClick={handleClear} variant='ghost' size='icon' title='Clear board' className='ml-auto text-red-500 hover:bg-red-50 hover:text-red-600'>
            <Trash2 size={17} />
          </Button>
        </div>
      </Card>
    </div>
  );
}

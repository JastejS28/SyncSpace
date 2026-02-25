'use client';

import { useBoardStore, ToolType } from '@/store/boardStore';
import { MousePointer2, Pencil, Square, Circle, Type, Undo, Redo, Bold, Italic, Underline, Trash2 } from 'lucide-react';
import { socketService } from '@/services/socketService';

export default function Toolbar({ roomId }: { roomId: string }) {
  const { 
    activeTool, setActiveTool, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth,
    fontSize, setFontSize, isBold, toggleBold, isItalic, toggleItalic, isUnderline, toggleUnderline,
    undo, redo, history, historyStep, isReadOnly, clearBoard // <-- ADD THIS
  } = useBoardStore();


  const tools: { id: ToolType; icon: React.ReactNode }[] = [
    { id: 'select', icon: <MousePointer2 size={20} /> },
    { id: 'pen', icon: <Pencil size={20} /> },
    { id: 'rectangle', icon: <Square size={20} /> },
    { id: 'circle', icon: <Circle size={20} /> },
    { id: 'text', icon: <Type size={20} /> },
  ];

  const colors = ['#000000', '#EF4444', '#3B82F6', '#22C55E', '#EAB308'];

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

    if (isReadOnly) return null;

    const handleClear = () => {
    if (window.confirm("Are you sure you want to completely clear the board? This cannot be undone.")) {
      clearBoard();
      if (socketService.socket) {
        socketService.socket.emit('clear-board', { roomId });
      }
    }
  };


  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
      <div className="bg-white border-2 border-black rounded-xl p-2 flex flex-col gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-3 rounded-lg transition-colors ${activeTool === tool.id ? 'bg-black text-white' : 'hover:bg-gray-100 text-black'}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="bg-white border-2 border-black rounded-xl p-4 flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[150px]">
        
        {/* Color Picker */}
        <div>
          <label className="text-xs font-bold block mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color} onClick={() => setStrokeColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${strokeColor === color ? 'border-black scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Properties: Show stroke width for drawing, show text formatting for text */}
        {activeTool !== 'text' ? (
          <div>
            <label className="text-xs font-bold block mb-2">Stroke Width</label>
            <input type="range" min="1" max="10" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full cursor-pointer accent-black" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 border-t-2 border-gray-100 pt-3">
            <div>
              <label className="text-xs font-bold block mb-2">Font Size</label>
              <input type="number" min="10" max="100" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full border rounded p-1 text-sm" />
            </div>
            <div className="flex gap-1 justify-between">
              <button onClick={toggleBold} className={`p-2 rounded ${isBold ? 'bg-black text-white' : 'bg-gray-100'}`}><Bold size={16} /></button>
              <button onClick={toggleItalic} className={`p-2 rounded ${isItalic ? 'bg-black text-white' : 'bg-gray-100'}`}><Italic size={16} /></button>
              <button onClick={toggleUnderline} className={`p-2 rounded ${isUnderline ? 'bg-black text-white' : 'bg-gray-100'}`}><Underline size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-2 border-black rounded-xl p-2 flex justify-between gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <button onClick={handleUndo} disabled={historyStep === 0} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30">
          <Undo size={20} />
        </button>
        <button onClick={handleRedo} disabled={historyStep === history.length - 1} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30">
          <Redo size={20} />
        </button>
      </div>

      
      {/* Nuke Button */}
        <button 
          onClick={handleClear}
          className="p-2 rounded-lg transition-all hover:bg-red-50 text-gray-500 hover:text-red-500"
          title="Clear Board"
        >
          <Trash2 size={24} />
        </button>



    </div>
  );
}
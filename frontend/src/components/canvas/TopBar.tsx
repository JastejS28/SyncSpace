import { Share, Download, Image as ImageIcon, Sparkles, FileText } from 'lucide-react';

type ActiveUser = {
  id: string;
  name: string;
  color: string;
};

type TopBarProps = {
  boardName: string;
  isOwner: boolean;
  activeUsers: ActiveUser[];
  isReadOnly: boolean;
  isUploadingImage: boolean;
  isAIOpen: boolean;
  onBoardNameChange: (name: string) => void;
  onBoardNameBlur: () => void;
  onToggleAI: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenShare: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
};

export default function TopBar({
  boardName,
  isOwner,
  activeUsers,
  isReadOnly,
  isUploadingImage,
  isAIOpen,
  onBoardNameChange,
  onBoardNameBlur,
  onToggleAI,
  onImageUpload,
  onOpenShare,
  onExportPNG,
  onExportPDF,
}: TopBarProps) {
  return (
    <div className='absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none'>
      <div className='pointer-events-auto ml-16 rounded-xl border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm'>
        <input
          type='text'
          value={boardName}
          onChange={(e) => onBoardNameChange(e.target.value)}
          disabled={!isOwner}
          onBlur={onBoardNameBlur}
          className='w-48 rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none transition-all hover:border-slate-200 focus:border-blue-300 focus:bg-white lg:w-64 disabled:opacity-70'
        />
      </div>

      <div className='pointer-events-auto flex items-center gap-3'>
        <div className='flex flex-row-reverse items-center'>
          {activeUsers.map((u, idx) => (
            <div
              key={u.id}
              title={u.name}
              className='-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm'
              style={{ backgroundColor: u.color, zIndex: idx }}
            >
              {u.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

        <div className='mx-1 h-6 w-px bg-slate-300'></div>

        <button
          onClick={onToggleAI}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${isAIOpen ? 'bg-blue-800' : 'bg-blue-700 hover:bg-blue-800'}`}
        >
          <Sparkles size={16} /> AI Co-Pilot
        </button>

        {!isReadOnly && (
          <label className={`cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all flex ${isUploadingImage ? 'bg-slate-100 opacity-60 cursor-wait' : 'hover:bg-slate-50'}`}>
            <ImageIcon size={16} /> {isUploadingImage ? 'Uploading...' : 'Image'}
            <input type='file' accept='image/*' className='hidden' onChange={onImageUpload} disabled={isUploadingImage} />
          </label>
        )}

        <button onClick={onOpenShare} className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50'>
          <Share size={16} /> Share
        </button>

        <button onClick={onExportPNG} className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50'>
          <Download size={16} /> PNG
        </button>

        <button onClick={onExportPDF} className='flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800'>
          <FileText size={16} /> PDF
        </button>
      </div>
    </div>
  );
}

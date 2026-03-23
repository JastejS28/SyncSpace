import type { AccessMode } from './types';

type ShareModalProps = {
  isOpen: boolean;
  isOwner: boolean;
  isReadOnly: boolean;
  accessMode: AccessMode;
  copySuccess: boolean;
  onClose: () => void;
  onAccessChange: (mode: AccessMode) => void;
  onCopyLink: () => void;
};

export default function ShareModal({
  isOpen,
  isOwner,
  isReadOnly,
  accessMode,
  copySuccess,
  onClose,
  onAccessChange,
  onCopyLink,
}: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className='absolute inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl pointer-events-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-slate-900'>Share Board</h2>
          <button onClick={onClose} className='text-slate-400 hover:text-slate-700'>&times;</button>
        </div>

        {isOwner ? (
          <div className='mb-6'>
            <label className='mb-2 block text-sm font-semibold text-slate-700'>General Access</label>
            <select
              value={accessMode}
              onChange={(e) => onAccessChange(e.target.value as AccessMode)}
              className='block w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-blue-500'
            >
              <option value='RESTRICTED'>Restricted (Only you can access)</option>
              <option value='VIEW'>Anyone with the link can View</option>
              <option value='EDIT'>Anyone with the link can Edit</option>
            </select>
          </div>
        ) : (
          <p className='mb-6 border-l-4 border-blue-500 bg-blue-50 py-2 pl-3 text-sm text-slate-500'>
            You are a {isReadOnly ? 'Viewer' : 'Editor'} on this board. Only the owner can change access settings.
          </p>
        )}

        <div className='flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2'>
          <input
            type='text'
            readOnly
            value={typeof window !== 'undefined' ? window.location.href : ''}
            className='w-full bg-transparent text-sm text-slate-600 outline-none'
          />
          <button
            onClick={onCopyLink}
            disabled={accessMode === 'RESTRICTED' && isOwner}
            className='whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50'
          >
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

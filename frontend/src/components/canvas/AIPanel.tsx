import { Sparkles, X, Send } from 'lucide-react';
import type { ChatMessage } from './types';

type AIPanelProps = {
  isOpen: boolean;
  isLoading: boolean;
  isReadOnly: boolean;
  aiPrompt: string;
  chatHistory: ChatMessage[];
  setAiPrompt: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function AIPanel({
  isOpen,
  isLoading,
  isReadOnly,
  aiPrompt,
  chatHistory,
  setAiPrompt,
  onClose,
  onSubmit,
}: AIPanelProps) {
  if (!isOpen) return null;

  return (
    <div className='absolute right-4 top-20 bottom-4 z-[100] flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl pointer-events-auto md:w-96'>
      <div className='flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4'>
        <h3 className='flex items-center gap-2 font-bold text-slate-800'>
          <Sparkles size={18} className='text-blue-600' /> SyncSpace AI
        </h3>
        <button onClick={onClose} className='text-slate-400 transition-colors hover:text-slate-700'>
          <X size={20} />
        </button>
      </div>

      <div className='flex flex-1 flex-col gap-4 overflow-y-auto bg-white p-4 text-sm'>
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <span className='mb-1 px-1 text-xs font-semibold text-slate-400'>{msg.role === 'user' ? 'You' : 'AI'}</span>
            <div className={`rounded-xl p-3 shadow-sm ${msg.role === 'user' ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm border border-slate-200 bg-slate-100 text-slate-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className='self-start flex flex-col items-start max-w-[85%]'>
            <span className='mb-1 px-1 text-xs font-semibold text-slate-400'>AI</span>
            <div className='flex items-center gap-2 rounded-xl rounded-bl-sm border border-slate-200 bg-slate-100 p-4'>
              <span className='h-2 w-2 animate-bounce rounded-full bg-blue-400'></span>
              <span className='h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-75'></span>
              <span className='h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-150'></span>
            </div>
          </div>
        )}
      </div>

      <div className='flex gap-2 border-t border-slate-200 bg-slate-50 p-3'>
        <input
          type='text'
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          disabled={isLoading || isReadOnly}
          placeholder='e.g., Draw a user login flowchart...'
          className='flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 disabled:opacity-50'
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !aiPrompt.trim() || isReadOnly}
          className='rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

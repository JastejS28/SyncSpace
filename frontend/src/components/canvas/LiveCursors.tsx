import type { RemoteCursor } from './types';

type LiveCursorsProps = {
  remoteCursors: Record<string, RemoteCursor>;
  stageScale: number;
  stagePos: { x: number; y: number };
};

export default function LiveCursors({ remoteCursors, stageScale, stagePos }: LiveCursorsProps) {
  return (
    <>
      {Object.entries(remoteCursors).map(([id, cursor]) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            top: cursor.y * stageScale + stagePos.y,
            left: cursor.x * stageScale + stagePos.x,
            zIndex: 9999,
            pointerEvents: 'none',
            transform: 'translate(-2px, -2px)',
          }}
          className='transition-all duration-75 ease-linear'
        >
          <svg width='24' height='36' viewBox='0 0 24 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M0 0L24 12L12 16L8 36L0 0Z' fill={cursor.color} stroke='white' strokeWidth='2' strokeLinejoin='round' />
          </svg>
          <div className='px-2 py-1 rounded-md text-white text-xs font-bold mt-1 shadow-md whitespace-nowrap' style={{ backgroundColor: cursor.color, width: 'max-content' }}>
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  );
}

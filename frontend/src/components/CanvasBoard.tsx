'use client';

import { useEffect, useState, useRef, Fragment } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useBoardStore, CanvasShape } from '@/store/boardStore';
import { useUser } from '@stackframe/stack';
import TopBar from './canvas/TopBar';
import ShareModal from './canvas/ShareModal';
import AIPanel from './canvas/AIPanel';
import LiveCursors from './canvas/LiveCursors';
import { renderShape } from './canvas/renderShape';
import type { AccessMode, RemoteCursor } from './canvas/types';
import { useBoardSession } from './canvas/hooks/useBoardSession';
import { useBoardAutosave } from './canvas/hooks/useBoardAutosave';
import { useCanvasViewport } from './canvas/hooks/useCanvasViewport';
import { useCanvasHotkeys } from './canvas/hooks/useCanvasHotkeys';
import { useAICopilot } from './canvas/hooks/useAICopilot';
import { useCanvasInteractions } from './canvas/hooks/useCanvasInteractions';
import { useBoardActions } from './canvas/hooks/useBoardActions';

interface CanvasBoardProps {
  roomId: string;
}

const USER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function CanvasBoard({ roomId }: CanvasBoardProps) {
  const user = useUser({ or: 'redirect' });
  const [isMounted, setIsMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    shapes,
    addShape,
    activeTool,
    strokeColor,
    strokeWidth,
    selectedShapeIds,
    setSelectedShapeIds,
    fontSize,
    isBold,
    isItalic,
    isUnderline,
    isReadOnly,
    setIsReadOnly,
    clearBoard,
    deleteShapes,
  } = useBoardStore();

  const [remoteShapes, setRemoteShapes] = useState<{ [userId: string]: CanvasShape }>({});
  const lastSavedState = useRef<string>('[]');

  const [boardName, setBoardName] = useState<string>('Untitled Board');
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});

  const [isOwner, setIsOwner] = useState(false);
  const [accessMode, setAccessMode] = useState<AccessMode>('RESTRICTED');

  const { stagePos, setStagePos, stageScale, handleWheel } = useCanvasViewport();

  const { isSpacePressed } = useCanvasHotkeys({
    roomId,
    isReadOnly,
    selectedShapeIds,
    deleteShapes,
    setSelectedShapeIds,
  });

  const localUserColor = useRef(USER_COLORS[(user?.id?.length || 0) % USER_COLORS.length]);
  const localUserName = user?.displayName || user?.primaryEmail?.split('@')[0] || 'Anonymous';

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useBoardSession({
    roomId,
    user,
    addShape,
    clearBoard,
    deleteShapes,
    setIsReadOnly,
    setIsMounted,
    setDimensions,
    setRemoteShapes,
    setRemoteCursors,
    setIsOwner,
    setAccessMode,
    setBoardName,
    lastSavedState,
  });

  useBoardAutosave({ roomId, user, isReadOnly, boardName, stageRef, lastSavedState });

  const { isAIOpen, setIsAIOpen, aiPrompt, setAiPrompt, chatHistory, isAILoading, handleAIRequest } = useAICopilot({
    roomId,
    user,
    isReadOnly,
    stageRef,
    stagePos,
    stageScale,
    addShape,
  });

  const {
    activeShape,
    selectionBox,
    textInput,
    handleTextChange,
    handleDblClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDragEnd,
    handleTransformEnd,
  } = useCanvasInteractions({
    roomId,
    user,
    shapes,
    addShape,
    activeTool,
    strokeColor,
    strokeWidth,
    selectedShapeIds,
    setSelectedShapeIds,
    fontSize,
    isBold,
    isItalic,
    isUnderline,
    isReadOnly,
    isSpacePressed,
    stagePos,
    stageScale,
    localUserName,
    localUserColor: localUserColor.current,
  });

  const {
    showShareModal,
    copySuccess,
    isUploadingImage,
    openShareModal,
    closeShareModal,
    handleAccessChange,
    handleImageUpload,
    handleCopyLink,
    handleExportPNG,
    handleExportPDF,
  } = useBoardActions({
    roomId,
    user,
    isReadOnly,
    boardName,
    dimensions,
    stagePos,
    stageScale,
    stageRef,
    addShape,
    accessMode,
    setAccessMode,
  });

  useEffect(() => {
    if (trRef.current && layerRef.current) {
      const nodes = selectedShapeIds.map((id) => layerRef.current.findOne(`#${id}`)).filter(Boolean);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeIds, shapes]);

  if (!isMounted || !user) {
    return <div className='flex h-screen w-full items-center justify-center text-sm font-semibold text-slate-600'>Loading canvas...</div>;
  }

  const activeUsers = [
    { id: user.id, name: localUserName, color: localUserColor.current },
    ...Object.entries(remoteCursors).map(([id, data]) => ({ id, name: data.name, color: data.color })),
  ];

  let canvasCursor = 'crosshair';
  if (isReadOnly) canvasCursor = 'default';
  else if (isSpacePressed) canvasCursor = 'grab';
  else if (activeTool === 'text') canvasCursor = 'text';
  else if (activeTool === 'select') canvasCursor = 'default';

  return (
    <div className='relative h-screen w-full overflow-hidden bg-slate-50/70' style={{ cursor: canvasCursor }}>
      <TopBar
        boardName={boardName}
        isOwner={isOwner}
        activeUsers={activeUsers}
        isReadOnly={isReadOnly}
        isUploadingImage={isUploadingImage}
        isAIOpen={isAIOpen}
        onBoardNameChange={setBoardName}
        onBoardNameBlur={() => {
          if (isOwner) lastSavedState.current = 'FORCE_SAVE';
        }}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        onImageUpload={handleImageUpload}
        onOpenShare={openShareModal}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
      />

      <ShareModal
        isOpen={showShareModal}
        isOwner={isOwner}
        isReadOnly={isReadOnly}
        accessMode={accessMode}
        copySuccess={copySuccess}
        onClose={closeShareModal}
        onAccessChange={handleAccessChange}
        onCopyLink={handleCopyLink}
      />

      <AIPanel
        isOpen={isAIOpen}
        isLoading={isAILoading}
        isReadOnly={isReadOnly}
        aiPrompt={aiPrompt}
        chatHistory={chatHistory}
        setAiPrompt={setAiPrompt}
        onClose={() => setIsAIOpen(false)}
        onSubmit={handleAIRequest}
      />

      <LiveCursors remoteCursors={remoteCursors} stageScale={stageScale} stagePos={stagePos} />

      {textInput && !isReadOnly && (
        <textarea
          autoFocus
          value={textInput.value}
          onChange={handleTextChange}
          style={{
            position: 'absolute',
            top: textInput.y * stageScale + stagePos.y + 'px',
            left: textInput.x * stageScale + stagePos.x + 'px',
            color: strokeColor,
            fontSize: fontSize * stageScale + 'px',
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
            background: 'transparent',
            border: '1px dashed #000',
            outline: 'none',
            padding: 0,
            margin: 0,
            resize: 'none',
            zIndex: 50,
            whiteSpace: 'pre',
            fontFamily: 'sans-serif',
          }}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
            e.currentTarget.style.width = 'auto';
            e.currentTarget.style.width = e.currentTarget.scrollWidth + 'px';
          }}
        />
      )}

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={isSpacePressed}
        onWheel={handleWheel}
        onDragEnd={(e) => {
          if (isReadOnly) return;
          if (e.target === stageRef.current) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onDblClick={handleDblClick}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer ref={layerRef}>
          <Rect x={-50000} y={-50000} width={100000} height={100000} fill='#ffffff' listening={false} />

          {shapes.map((shape) => (
            <Fragment key={shape.id}>
              {renderShape({
                shape,
                isSelectTool: activeTool === 'select',
                isSelected: selectedShapeIds.includes(shape.id),
                isReadOnly,
                isSpacePressed,
                isBeingEdited: textInput?.id === shape.id,
                onDragEnd: handleDragEnd,
                onTransformEnd: handleTransformEnd,
              })}
            </Fragment>
          ))}

          <Transformer
            ref={trRef}
            resizeEnabled={true}
            rotateEnabled={false}
            borderStroke='#0096FF'
            borderStrokeWidth={2}
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />

          {selectionBox?.visible && (
            <Rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill='rgba(0, 161, 255, 0.2)'
              stroke='#00A1FF'
              strokeWidth={1}
            />
          )}
        </Layer>
        <Layer>
          {Object.values(remoteShapes).map((shape) => (
            <Fragment key={`remote-${shape.id}`}>
              {renderShape({
                shape,
                isVolatile: true,
                isSelectTool: activeTool === 'select',
                isSelected: selectedShapeIds.includes(shape.id),
                isReadOnly,
                isSpacePressed,
                isBeingEdited: textInput?.id === shape.id,
                onDragEnd: handleDragEnd,
                onTransformEnd: handleTransformEnd,
              })}
            </Fragment>
          ))}

          {activeShape &&
            renderShape({
              shape: activeShape,
              isSelectTool: activeTool === 'select',
              isSelected: selectedShapeIds.includes(activeShape.id),
              isReadOnly,
              isSpacePressed,
              isBeingEdited: textInput?.id === activeShape.id,
              onDragEnd: handleDragEnd,
              onTransformEnd: handleTransformEnd,
            })}
        </Layer>
      </Stage>
    </div>
  );
}

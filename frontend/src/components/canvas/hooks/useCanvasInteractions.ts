import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { socketService } from '@/services/socketService';
import { useBoardStore, CanvasShape, ToolType } from '@/store/boardStore';

type UseCanvasInteractionsArgs = {
  roomId: string;
  user: { id: string } | null | undefined;
  shapes: CanvasShape[];
  addShape: (shape: CanvasShape) => void;
  activeTool: ToolType;
  strokeColor: string;
  strokeWidth: number;
  selectedShapeIds: string[];
  setSelectedShapeIds: (ids: string[]) => void;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isReadOnly: boolean;
  isSpacePressed: boolean;
  stagePos: { x: number; y: number };
  stageScale: number;
  localUserName: string;
  localUserColor: string;
};

export function useCanvasInteractions({
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
  localUserColor,
}: UseCanvasInteractionsArgs) {
  const [activeShape, setActiveShape] = useState<CanvasShape | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ visible: boolean; x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [textInput, setTextInput] = useState<{ id?: string; x: number; y: number; value: string } | null>(null);
  const isDrawing = useRef(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!textInput || !textInput.id || !user || isReadOnly) return;
    const newValue = e.target.value;
    setTextInput({ ...textInput, value: newValue });

    let style: CanvasShape['fontStyle'] = 'normal';
    if (isBold && isItalic) style = 'italic bold';
    else if (isBold) style = 'bold';
    else if (isItalic) style = 'italic';
    const decoration: 'underline' | 'empty' = isUnderline ? 'underline' : 'empty';

    const volatileTextShape: CanvasShape = {
      id: textInput.id,
      type: 'text',
      x: textInput.x,
      y: textInput.y,
      text: newValue,
      stroke: strokeColor,
      fontSize,
      fontStyle: style,
      textDecoration: decoration,
    };

    if (socketService.socket) {
      socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: volatileTextShape });
    }
  };

  const commitText = () => {
    if (textInput && textInput.id && textInput.value.trim() !== '' && !isReadOnly) {
      let style: CanvasShape['fontStyle'] = 'normal';
      if (isBold && isItalic) style = 'italic bold';
      else if (isBold) style = 'bold';
      else if (isItalic) style = 'italic';
      const decoration: 'underline' | 'empty' = isUnderline ? 'underline' : 'empty';

      const finalShape: CanvasShape = {
        id: textInput.id,
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        text: textInput.value,
        stroke: strokeColor,
        fontSize,
        fontStyle: style,
        textDecoration: decoration,
      };

      const isEditingExisting = shapes.some((s) => s.id === textInput.id);

      if (isEditingExisting) {
        useBoardStore.getState().updateShape(textInput.id, finalShape);
        if (socketService.socket && user) socketService.socket.emit('shape-update', { roomId, shape: finalShape });
      } else {
        addShape(finalShape);
        if (socketService.socket && user) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: finalShape });
      }
    }
    setTextInput(null);
  };

  const handleDblClick = (e: any) => {
    if (isReadOnly || isSpacePressed) return;
    const clickedNode = e.target;
    if (clickedNode.getClassName() === 'Text') {
      const shapeId = clickedNode.id();
      const shape = shapes.find((s) => s.id === shapeId);
      if (shape) {
        setTextInput({ id: shape.id, x: shape.x, y: shape.y, value: shape.text || '' });
        setSelectedShapeIds([]);
      }
    }
  };

  const handleMouseDown = (e: any) => {
    if (isReadOnly || isSpacePressed) return;

    const clickedNode = e.target;
    if (clickedNode.getParent()?.className === 'Transformer') {
      return;
    }

    const pos = e.target.getStage().getPointerPosition();

    const trueX = (pos.x - stagePos.x) / stageScale;
    const trueY = (pos.y - stagePos.y) / stageScale;

    if (textInput) {
      commitText();
      return;
    }

    if (activeTool === 'text') {
      if (clickedNode.getClassName() === 'Text') {
        const shapeId = clickedNode.id();
        const shape = shapes.find((s) => s.id === shapeId);
        if (shape) setTextInput({ id: shape.id, x: shape.x, y: shape.y, value: shape.text || '' });
      } else {
        setTextInput({ id: uuidv4(), x: trueX, y: trueY, value: '' });
      }
      setSelectedShapeIds([]);
      return;
    }

    const clickedOnEmptySpace = clickedNode === clickedNode.getStage();
    if (activeTool === 'select') {
      if (clickedOnEmptySpace) {
        setSelectionBox({ visible: true, x1: trueX, y1: trueY, x2: trueX, y2: trueY });
        setSelectedShapeIds([]);
      } else {
        const clickedShapeId = clickedNode.id();
        if (e.evt.shiftKey) {
          if (!selectedShapeIds.includes(clickedShapeId)) setSelectedShapeIds([...selectedShapeIds, clickedShapeId]);
        } else {
          setSelectedShapeIds([clickedShapeId]);
        }
      }
      return;
    }

    isDrawing.current = true;
    setSelectedShapeIds([]);
    setActiveShape({
      id: uuidv4(),
      type: activeTool === 'pen' ? 'line' : (activeTool as any),
      x: trueX,
      y: trueY,
      width: 0,
      height: 0,
      points: activeTool === 'pen' ? [trueX, trueY] : undefined,
      stroke: strokeColor,
      strokeWidth,
    });
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    const trueX = (pos.x - stagePos.x) / stageScale;
    const trueY = (pos.y - stagePos.y) / stageScale;

    if (socketService.socket && user) {
      socketService.socket.emit('cursor-move', {
        roomId,
        userId: user.id,
        name: localUserName,
        color: localUserColor,
        x: trueX,
        y: trueY,
      });
    }

    if (isReadOnly || isSpacePressed) return;

    if (activeTool === 'select' && selectionBox?.visible) {
      setSelectionBox({ ...selectionBox, x2: trueX, y2: trueY });
      return;
    }

    if (!isDrawing.current || !activeShape || !user) return;
    const updatedShape = { ...activeShape };

    if (activeTool === 'pen') updatedShape.points = [...(activeShape.points || []), trueX, trueY];
    else if (activeTool === 'rectangle') {
      updatedShape.width = trueX - activeShape.x;
      updatedShape.height = trueY - activeShape.y;
    } else if (activeTool === 'circle') {
      updatedShape.width = Math.sqrt(Math.pow(trueX - activeShape.x, 2) + Math.pow(trueY - activeShape.y, 2));
    }

    setActiveShape(updatedShape);
    if (socketService.socket) socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: updatedShape });
  };

  const handleMouseUp = () => {
    if (isReadOnly || isSpacePressed) return;

    if (activeTool === 'select' && selectionBox?.visible) {
      const boxMinX = Math.min(selectionBox.x1, selectionBox.x2);
      const boxMaxX = Math.max(selectionBox.x1, selectionBox.x2);
      const boxMinY = Math.min(selectionBox.y1, selectionBox.y2);
      const boxMaxY = Math.max(selectionBox.y1, selectionBox.y2);

      const selected = shapes.filter((shape) => {
        let sMinX = shape.x;
        let sMaxX = shape.x;
        let sMinY = shape.y;
        let sMaxY = shape.y;

        if (shape.type === 'rectangle') {
          sMaxX = shape.x + (shape.width || 0);
          sMaxY = shape.y + (shape.height || 0);
        } else if (shape.type === 'circle') {
          const r = shape.width || 0;
          sMinX = shape.x - r;
          sMaxX = shape.x + r;
          sMinY = shape.y - r;
          sMaxY = shape.y + r;
        } else if (shape.type === 'line' && shape.points) {
          const xs = shape.points.filter((_, i) => i % 2 === 0);
          const ys = shape.points.filter((_, i) => i % 2 !== 0);
          sMinX = Math.min(...xs);
          sMaxX = Math.max(...xs);
          sMinY = Math.min(...ys);
          sMaxY = Math.max(...ys);
        }

        return sMinX >= boxMinX && sMaxX <= boxMaxX && sMinY >= boxMinY && sMaxY <= boxMaxY;
      });

      setSelectedShapeIds(selected.map((s) => s.id));
      setSelectionBox(null);
      return;
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (activeShape && user) {
      const finalShape = { ...activeShape };

      if (finalShape.type === 'rectangle') {
        if ((finalShape.width || 0) < 0) {
          finalShape.x += finalShape.width || 0;
          finalShape.width = Math.abs(finalShape.width || 0);
        }
        if ((finalShape.height || 0) < 0) {
          finalShape.y += finalShape.height || 0;
          finalShape.height = Math.abs(finalShape.height || 0);
        }
      } else if (finalShape.type === 'circle') {
        finalShape.width = Math.abs(finalShape.width || 0);
      }

      addShape(finalShape);
      if (socketService.socket) {
        socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: finalShape });
      }
    }
    setActiveShape(null);
  };

  const handleDragEnd = (e: any, shapeId: string) => {
    if (isReadOnly) return;
    const node = e.target;
    const newX = node.x();
    const newY = node.y();

    const shape = useBoardStore.getState().shapes.find((s) => s.id === shapeId);
    if (shape) {
      const updatedShape = { ...shape, x: newX, y: newY };
      useBoardStore.getState().updateShape(shapeId, { x: newX, y: newY });
      socketService.socket?.emit('shape-update', { roomId, shape: updatedShape });
    }
  };

  const handleTransformEnd = (e: any, shapeId: string) => {
    if (isReadOnly) return;
    const node = e.target;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const shape = useBoardStore.getState().shapes.find((s) => s.id === shapeId);
    if (shape) {
      let newX = node.x();
      let newY = node.y();
      let newWidth = node.width() * scaleX;
      let newHeight = node.height() * scaleY;

      if (newWidth < 0) {
        newX += newWidth;
        newWidth = Math.abs(newWidth);
      }
      if (newHeight < 0) {
        newY += newHeight;
        newHeight = Math.abs(newHeight);
      }

      const updatedProps: any = { x: newX, y: newY };

      if (shape.type === 'circle') {
        const maxScale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
        updatedProps.width = Math.max(5, (shape.width || 0) * maxScale);
      } else {
        updatedProps.width = Math.max(5, newWidth);
        updatedProps.height = Math.max(5, newHeight);
      }

      useBoardStore.getState().updateShape(shapeId, updatedProps);
      if (socketService.socket) {
        socketService.socket.emit('shape-update', { roomId, shape: { ...shape, ...updatedProps } });
      }
    }
  };

  return {
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
  };
}

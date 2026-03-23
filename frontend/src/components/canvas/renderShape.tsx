import { Line, Rect, Circle, Text } from 'react-konva';
import type { CanvasShape } from '@/store/boardStore';
import URLImage from './URLImage';

type RenderShapeArgs = {
  shape: CanvasShape;
  isVolatile?: boolean;
  isSelectTool: boolean;
  isSelected: boolean;
  isReadOnly: boolean;
  isSpacePressed: boolean;
  isBeingEdited: boolean;
  onDragEnd: (e: any, shapeId: string) => void;
  onTransformEnd: (e: any, shapeId: string) => void;
};

export function renderShape({
  shape,
  isVolatile = false,
  isSelectTool,
  isSelected,
  isReadOnly,
  isSpacePressed,
  isBeingEdited,
  onDragEnd,
  onTransformEnd,
}: RenderShapeArgs) {
  const commonProps = {
    id: shape.id,
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth || 3,
    opacity: isBeingEdited ? 0 : isVolatile ? 0.6 : 1,
    draggable: isSelectTool && !isVolatile && isSelected && !isReadOnly && !isSpacePressed,
    onDragEnd: (e: any) => onDragEnd(e, shape.id),
    onTransformEnd: (e: any) => onTransformEnd(e, shape.id),
    onMouseEnter: (e: any) => {
      if (isSelectTool && !isReadOnly && !isSpacePressed) {
        e.target.getStage().container().style.cursor = 'grab';
      }
    },
    onMouseLeave: (e: any) => {
      if (isSelectTool && !isReadOnly && !isSpacePressed) {
        e.target.getStage().container().style.cursor = 'default';
      }
    },
  };

  if (shape.type === 'line') {
    return <Line {...commonProps} points={shape.points || []} tension={0.5} lineCap='round' lineJoin='round' />;
  }
  if (shape.type === 'rectangle') {
    return (
      <Rect
        {...commonProps}
        x={shape.x}
        y={shape.y}
        width={shape.width || 0}
        height={shape.height || 0}
        fill={shape.fill || 'transparent'}
        cornerRadius={shape.cornerRadius || 0}
      />
    );
  }
  if (shape.type === 'circle') {
    return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.width || 0} fill={shape.fill || 'transparent'} />;
  }
  if (shape.type === 'text') {
    return (
      <Text
        key={shape.id}
        {...commonProps}
        x={shape.x}
        y={shape.y}
        text={shape.text}
        fontSize={shape.fontSize || 24}
        fontStyle={shape.fontStyle || 'normal'}
        textDecoration={shape.textDecoration || 'empty'}
        fill={shape.stroke}
        fontFamily={shape.fontFamily || 'sans-serif'}
        strokeEnabled={false}
      />
    );
  }
  if (shape.type === 'image') {
    return <URLImage key={shape.id} shape={shape} commonProps={commonProps} />;
  }

  return null;
}

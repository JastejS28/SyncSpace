import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import type { CanvasShape } from '@/store/boardStore';

type URLImageProps = {
  shape: CanvasShape;
  commonProps: any;
};

export default function URLImage({ shape, commonProps }: URLImageProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!shape.url) return;

    const imageObj = new window.Image();
    imageObj.crossOrigin = 'Anonymous';
    imageObj.src = shape.url;
    imageObj.onload = () => setImg(imageObj);
  }, [shape.url]);

  if (!img) return null;

  return (
    <KonvaImage
      {...commonProps}
      image={img}
      x={shape.x}
      y={shape.y}
      width={shape.width || img.width}
      height={shape.height || img.height}
    />
  );
}

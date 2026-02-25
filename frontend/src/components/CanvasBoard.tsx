// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { Stage, Layer, Line } from 'react-konva';
// import { useBoardStore, CanvasShape } from '@/store/boardStore';
// import { v4 as uuidv4 } from 'uuid';
// import { socketService } from '@/services/socketService';
// import { useUser } from '@stackframe/stack';

// interface CanvasBoardProps {
//   roomId: string;
// }

// export default function CanvasBoard({ roomId }: CanvasBoardProps) {
//   const user = useUser({ or: 'redirect' });
//   const [isMounted, setIsMounted] = useState(false);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   // 1. Global State (Committed History)
//   const shapes = useBoardStore((state) => state.shapes);
//   const addShape = useBoardStore((state) => state.addShape);
  
//   // 2. Local State (Your live ink)
//   const [activeLine, setActiveLine] = useState<CanvasShape | null>(null);
//   const isDrawing = useRef(false);

//   // 3. Remote State (Other users' live ink, mapped by their User ID)
//   const [remoteLines, setRemoteLines] = useState<{ [userId: string]: CanvasShape }>({});

//   const tool = 'pen'; 

//   useEffect(() => {
//     if (!user) return;
//     setIsMounted(true);
//     setDimensions({ width: window.innerWidth, height: window.innerHeight });

//     const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', handleResize);

//     const socket = socketService.connect(roomId, user.id);

//     // --- LISTENER A: The Volatile Stream (Live Ink) ---
//     socket?.on('draw-stream-update', (data: { userId: string, shape: CanvasShape }) => {
//       // Update the dictionary with the remote user's current live line
//       setRemoteLines((prev) => ({
//         ...prev,
//         [data.userId]: data.shape
//       }));
//     });

//     // --- LISTENER B: The Guaranteed Commit (Final Shape) ---
//     socket?.on('draw-update', (data: { userId: string, action: string, shape: CanvasShape }) => {
//       if (data.action === 'add') {
//         addShape(data.shape); // Save it to the permanent Zustand memory
        
//         // Wipe their volatile live line from the screen, because the permanent one just arrived
//         setRemoteLines((prev) => {
//           const newState = { ...prev };
//           delete newState[data.userId];
//           return newState;
//         });
//       }
//     });

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       socketService.disconnect(roomId, user.id);
//       socket?.off('draw-stream-update');
//       socket?.off('draw-update');
//     };
//   }, [roomId, user, addShape]);


//   const handleMouseDown = (e: any) => {
//     isDrawing.current = true;
//     const pos = e.target.getStage().getPointerPosition();
    
//     setActiveLine({
//       id: uuidv4(),
//       type: 'line',
//       x: 0, y: 0,
//       points: [pos.x, pos.y],
//       stroke: '#000000',
//     });
//   };

//   const handleMouseMove = (e: any) => {
//     if (!isDrawing.current || !activeLine || !user) return;
//     const stage = e.target.getStage();
//     const point = stage.getPointerPosition();

//     // 1. Calculate the new math
//     const newPoints = [...(activeLine.points || []), point.x, point.y];
//     const updatedLine = { ...activeLine, points: newPoints };

//     // 2. Update your screen instantly
//     setActiveLine(updatedLine);

//     // 3. Blast the volatile stream to the server
//     const socket = socketService.socket;
//     if (socket) {
//       socket.emit('draw-stream', {
//         roomId,
//         userId: user.id,
//         shape: updatedLine
//       });
//     }
//   };

//   const handleMouseUp = () => {
//     isDrawing.current = false;
    
//     if (activeLine && user) {
//       // 1. Commit to your local Zustand memory
//       addShape(activeLine);
      
//       // 2. Send the guaranteed final commit to the server
//       const socket = socketService.socket;
//       if (socket) {
//         socket.emit('draw-event', {
//           roomId,
//           userId: user.id, // We now pass userId so remote clients know whose volatile line to delete
//           action: 'add',
//           shape: activeLine
//         });
//       }
//     }
//     setActiveLine(null);
//   };

//   if (!isMounted || !user) return <div className="w-full h-screen flex items-center justify-center">Loading Canvas...</div>;

//   return (
//     <div className="w-full h-screen overflow-hidden bg-gray-50 cursor-crosshair">
//       <Stage width={dimensions.width} height={dimensions.height} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}>
//         <Layer>
//           {/* 1. The Permanent History (Everyone's committed lines) */}
//           {shapes.map((shape) => (
//             shape.type === 'line' ? <Line key={shape.id} points={shape.points || []} stroke={shape.stroke || '#000'} strokeWidth={3} tension={0.5} lineCap="round" lineJoin="round" /> : null
//           ))}

//           {/* 2. Other Users' Live Ink (Volatile) */}
//           {Object.values(remoteLines).map((shape) => (
//             shape.type === 'line' ? <Line key={`remote-${shape.id}`} points={shape.points || []} stroke={shape.stroke || '#000'} strokeWidth={3} tension={0.5} opacity={0.6} lineCap="round" lineJoin="round" /> : null
//           ))}

//           {/* 3. Your Live Ink */}
//           {activeLine && activeLine.type === 'line' && (
//             <Line points={activeLine.points || []} stroke={activeLine.stroke || '#000'} strokeWidth={3} tension={0.5} lineCap="round" lineJoin="round" />
//           )}
//         </Layer>
//       </Stage>
//     </div>
//   );
// }

// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { Stage, Layer, Line, Rect, Circle } from 'react-konva';
// import { useBoardStore, CanvasShape } from '@/store/boardStore';
// import { v4 as uuidv4 } from 'uuid';
// import { socketService } from '@/services/socketService';
// import { useUser } from '@stackframe/stack';

// interface CanvasBoardProps {
//   roomId: string;
// }

// export default function CanvasBoard({ roomId }: CanvasBoardProps) {
//   const user = useUser({ or: 'redirect' });
//   const [isMounted, setIsMounted] = useState(false);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   const shapes = useBoardStore((state) => state.shapes);
//   const addShape = useBoardStore((state) => state.addShape);
//   const activeTool = useBoardStore((state) => state.activeTool);
//   const strokeColor = useBoardStore((state) => state.strokeColor);
//   const strokeWidth = useBoardStore((state) => state.strokeWidth);
  
//   const [activeShape, setActiveShape] = useState<CanvasShape | null>(null);
//   const isDrawing = useRef(false);
//   const [remoteShapes, setRemoteShapes] = useState<{ [userId: string]: CanvasShape }>({});

//   useEffect(() => {
//     if (!user) return;
//     setIsMounted(true);
//     setDimensions({ width: window.innerWidth, height: window.innerHeight });

//     const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', handleResize);

//     const socket = socketService.connect(roomId, user.id);

//     socket?.on('draw-stream-update', (data: { userId: string, shape: CanvasShape }) => {
//       setRemoteShapes((prev) => ({ ...prev, [data.userId]: data.shape }));
//     });

//     socket?.on('draw-update', (data: { userId: string, action: string, shape: CanvasShape }) => {
//       if (data.action === 'add') {
//         addShape(data.shape); 
//         setRemoteShapes((prev) => {
//           const newState = { ...prev };
//           delete newState[data.userId];
//           return newState;
//         });
//       }
//     });

//     // --- Listener C: Catch Forced Time Travel ---
//     socket?.on('sync-full-state', (newShapes: CanvasShape[]) => {
//       console.log(`3. [Canvas] Received forced sync! Overwriting local board with ${newShapes.length} shapes.`);
//       useBoardStore.getState().forceReplaceBoard(newShapes);
//     });

//     // --- Listener D: Catch Drag & Drop Selection Moves ---
//     socket?.on('shape-updated', (updatedShape: CanvasShape) => {
//       console.log(`[Canvas] Received updated coordinates for shape ${updatedShape.id}`);
//       useBoardStore.getState().updateShape(updatedShape.id, updatedShape);
//     });

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       socketService.disconnect(roomId, user.id);
//       socket?.off('draw-stream-update');
//       socket?.off('draw-update');
//       socket?.off('sync-full-state');
//       socket?.off('shape-updated');
//     };
//   }, [roomId, user, addShape]);


//   const handleMouseDown = (e: any) => {
//     if (activeTool === 'select') return; 
//     isDrawing.current = true;
//     const pos = e.target.getStage().getPointerPosition();
    
//     setActiveShape({
//       id: uuidv4(),
//       type: activeTool === 'pen' ? 'line' : activeTool as any,
//       x: pos.x, y: pos.y, width: 0, height: 0,
//       points: activeTool === 'pen' ? [pos.x, pos.y] : undefined,
//       stroke: strokeColor, strokeWidth: strokeWidth,
//     });
//   };

//   const handleMouseMove = (e: any) => {
//     if (!isDrawing.current || !activeShape || !user) return;
//     const stage = e.target.getStage();
//     const point = stage.getPointerPosition();
//     let updatedShape = { ...activeShape };

//     if (activeTool === 'pen') {
//       updatedShape.points = [...(activeShape.points || []), point.x, point.y];
//     } else if (activeTool === 'rectangle') {
//       updatedShape.width = point.x - activeShape.x;
//       updatedShape.height = point.y - activeShape.y;
//     } else if (activeTool === 'circle') {
//       const radius = Math.sqrt(Math.pow(point.x - activeShape.x, 2) + Math.pow(point.y - activeShape.y, 2));
//       updatedShape.width = radius; 
//     }

//     setActiveShape(updatedShape);

//     if (socketService.socket) {
//       socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: updatedShape });
//     }
//   };

//   const handleMouseUp = () => {
//     if (!isDrawing.current) return;
//     isDrawing.current = false;
    
//     if (activeShape && user) {
//       addShape(activeShape);
//       if (socketService.socket) {
//         socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: activeShape });
//       }
//     }
//     setActiveShape(null);
//   };

//   // --- SELECTION MATH (Drag & Drop) ---
//   const handleDragEnd = (e: any, shapeId: string) => {
//     const node = e.target;
//     // Extract new physical coordinates after dropping
//     const newX = node.x();
//     const newY = node.y();

//     const shape = useBoardStore.getState().shapes.find(s => s.id === shapeId);
//     if (shape) {
//       const updatedShape = { ...shape, x: newX, y: newY };
      
//       console.log(`[Canvas] Drag ended. Broadcasting new coords for ${shapeId}: X:${newX}, Y:${newY}`);
//       useBoardStore.getState().updateShape(shapeId, { x: newX, y: newY });
//       socketService.socket?.emit('shape-update', { roomId, shape: updatedShape });
//     }
//   };

//   const renderShape = (shape: CanvasShape, isVolatile = false) => {
//     const isSelectTool = activeTool === 'select';
    
//     const commonProps = {
//       key: shape.id,
//       stroke: shape.stroke,
//       strokeWidth: shape.strokeWidth || 3,
//       opacity: isVolatile ? 0.6 : 1,
//       // Selection physics logic
//       draggable: isSelectTool && !isVolatile,
//       onDragEnd: (e: any) => handleDragEnd(e, shape.id),
//       onMouseEnter: (e: any) => { if (isSelectTool) e.target.getStage().container().style.cursor = 'grab'; },
//       onMouseLeave: (e: any) => { if (isSelectTool) e.target.getStage().container().style.cursor = 'default'; },
//     };

//     if (shape.type === 'line') return <Line {...commonProps} points={shape.points || []} tension={0.5} lineCap="round" lineJoin="round" />;
//     if (shape.type === 'rectangle') return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width || 0} height={shape.height || 0} />;
//     if (shape.type === 'circle') return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.width || 0} />;
//     return null;
//   };

//   if (!isMounted || !user) return <div className="w-full h-screen flex items-center justify-center">Loading Canvas...</div>;

//   return (
//     <div className="w-full h-screen overflow-hidden bg-gray-50" style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}>
//       <Stage width={dimensions.width} height={dimensions.height} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}>
//         <Layer>
//           {shapes.map((shape) => renderShape(shape))}
//         </Layer>
//         <Layer>
//           {Object.values(remoteShapes).map((shape) => renderShape(shape, true))}
//           {activeShape && renderShape(activeShape)}
//         </Layer>
//       </Stage>
//     </div>
//   );
// }



// //multiple hsapes being selectd and dragged-- collison logic
// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { Stage, Layer, Line, Rect, Circle, Transformer } from 'react-konva';
// import { useBoardStore, CanvasShape } from '@/store/boardStore';
// import { v4 as uuidv4 } from 'uuid';
// import { socketService } from '@/services/socketService';
// import { useUser } from '@stackframe/stack';

// interface CanvasBoardProps {
//   roomId: string;
// }

// export default function CanvasBoard({ roomId }: CanvasBoardProps) {
//   const user = useUser({ or: 'redirect' });
//   const [isMounted, setIsMounted] = useState(false);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   const shapes = useBoardStore((state) => state.shapes);
//   const addShape = useBoardStore((state) => state.addShape);
//   const activeTool = useBoardStore((state) => state.activeTool);
//   const strokeColor = useBoardStore((state) => state.strokeColor);
//   const strokeWidth = useBoardStore((state) => state.strokeWidth);
//   const selectedShapeIds = useBoardStore((state) => state.selectedShapeIds);
//   const setSelectedShapeIds = useBoardStore((state) => state.setSelectedShapeIds);
  
//   const [activeShape, setActiveShape] = useState<CanvasShape | null>(null);
//   const isDrawing = useRef(false);
//   const [remoteShapes, setRemoteShapes] = useState<{ [userId: string]: CanvasShape }>({});

//   // --- NEW: Multi-Select Marquee State ---
//   const [selectionBox, setSelectionBox] = useState<{ visible: boolean, x1: number, y1: number, x2: number, y2: number } | null>(null);
  
//   // --- NEW: Konva References for Grouping ---
//   const layerRef = useRef<any>(null);
//   const trRef = useRef<any>(null);

//   // Bind selected shapes to the Transformer visually
//   useEffect(() => {
//     if (trRef.current && layerRef.current) {
//       // Find all physical Konva nodes that match our selected IDs
//       const nodes = selectedShapeIds.map((id) => layerRef.current.findOne(`#${id}`)).filter(Boolean);
//       trRef.current.nodes(nodes);
//       trRef.current.getLayer().batchDraw();
//     }
//   }, [selectedShapeIds, shapes]);

//   useEffect(() => {
//     if (!user) return;
//     setIsMounted(true);
//     setDimensions({ width: window.innerWidth, height: window.innerHeight });
//     const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', handleResize);
//     const socket = socketService.connect(roomId, user.id);

//     socket?.on('draw-stream-update', (data) => setRemoteShapes((prev) => ({ ...prev, [data.userId]: data.shape })));
//     socket?.on('draw-update', (data) => {
//       if (data.action === 'add') {
//         addShape(data.shape); 
//         setRemoteShapes((prev) => { const newState = { ...prev }; delete newState[data.userId]; return newState; });
//       }
//     });
//     socket?.on('sync-full-state', (newShapes) => useBoardStore.getState().forceReplaceBoard(newShapes));
//     socket?.on('shape-updated', (updatedShape) => useBoardStore.getState().updateShape(updatedShape.id, updatedShape));

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       socketService.disconnect(roomId, user.id);
//       socket?.off('draw-stream-update'); socket?.off('draw-update'); socket?.off('sync-full-state'); socket?.off('shape-updated');
//     };
//   }, [roomId, user, addShape]);

//   const handleMouseDown = (e: any) => {
//     const pos = e.target.getStage().getPointerPosition();
    
//     // Check if we clicked the empty canvas background or a specific shape
//     const clickedOnEmptySpace = e.target === e.target.getStage();

//     if (activeTool === 'select') {
//       if (clickedOnEmptySpace) {
//         // Start drawing the blue selection box
//         setSelectionBox({ visible: true, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
//         setSelectedShapeIds([]); // Clear current selection
//       } else {
//         // We clicked a specific shape. Select it if it isn't already selected.
//         const clickedShapeId = e.target.id();
//         // Ignore clicks on the Transformer itself
//         if (clickedShapeId && !selectedShapeIds.includes(clickedShapeId)) {
//           setSelectedShapeIds([clickedShapeId]);
//         }
//       }
//       return; 
//     }

//     // Standard drawing logic
//     isDrawing.current = true;
//     setSelectedShapeIds([]); // Clear selection when drawing
//     setActiveShape({
//       id: uuidv4(), type: activeTool === 'pen' ? 'line' : activeTool as any,
//       x: pos.x, y: pos.y, width: 0, height: 0,
//       points: activeTool === 'pen' ? [pos.x, pos.y] : undefined,
//       stroke: strokeColor, strokeWidth: strokeWidth,
//     });
//   };

//   const handleMouseMove = (e: any) => {
//     const stage = e.target.getStage();
//     const point = stage.getPointerPosition();

//     // 1. Updating the Selection Box Marquee
//     if (activeTool === 'select' && selectionBox?.visible) {
//       setSelectionBox({ ...selectionBox, x2: point.x, y2: point.y });
//       return;
//     }

//     // 2. Standard drawing logic
//     if (!isDrawing.current || !activeShape || !user) return;
//     let updatedShape = { ...activeShape };

//     if (activeTool === 'pen') updatedShape.points = [...(activeShape.points || []), point.x, point.y];
//     else if (activeTool === 'rectangle') { updatedShape.width = point.x - activeShape.x; updatedShape.height = point.y - activeShape.y; }
//     else if (activeTool === 'circle') updatedShape.width = Math.sqrt(Math.pow(point.x - activeShape.x, 2) + Math.pow(point.y - activeShape.y, 2));

//     setActiveShape(updatedShape);
//     if (socketService.socket) socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: updatedShape });
//   };

//   const handleMouseUp = () => {
//     // 1. Finish Marquee Selection & Run Collision Physics
//     if (activeTool === 'select' && selectionBox?.visible) {
//       // Calculate the absolute bounding box of the blue rectangle
//       const boxMinX = Math.min(selectionBox.x1, selectionBox.x2);
//       const boxMaxX = Math.max(selectionBox.x1, selectionBox.x2);
//       const boxMinY = Math.min(selectionBox.y1, selectionBox.y2);
//       const boxMaxY = Math.max(selectionBox.y1, selectionBox.y2);

//       // AABB Collision Detection Engine
//       const selected = shapes.filter((shape) => {
//         let sMinX = shape.x, sMaxX = shape.x, sMinY = shape.y, sMaxY = shape.y;

//         if (shape.type === 'rectangle') {
//           sMaxX = shape.x + (shape.width || 0); sMaxY = shape.y + (shape.height || 0);
//         } else if (shape.type === 'circle') {
//           const r = shape.width || 0;
//           sMinX = shape.x - r; sMaxX = shape.x + r; sMinY = shape.y - r; sMaxY = shape.y + r;
//         } else if (shape.type === 'line' && shape.points) {
//           const xs = shape.points.filter((_, i) => i % 2 === 0);
//           const ys = shape.points.filter((_, i) => i % 2 !== 0);
//           sMinX = Math.min(...xs); sMaxX = Math.max(...xs); sMinY = Math.min(...ys); sMaxY = Math.max(...ys);
//         }

//         // Check if the shape is entirely inside the blue selection box
//         return sMinX >= boxMinX && sMaxX <= boxMaxX && sMinY >= boxMinY && sMaxY <= boxMaxY;
//       });

//       setSelectedShapeIds(selected.map(s => s.id));
//       setSelectionBox(null); // Hide the blue box
//       return;
//     }

//     // 2. Standard Finish Drawing Logic
//     if (!isDrawing.current) return;
//     isDrawing.current = false;
    
//     if (activeShape && user) {
//       addShape(activeShape);
//       if (socketService.socket) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: activeShape });
//     }
//     setActiveShape(null);
//   };

//   const handleDragEnd = (e: any, shapeId: string) => {
//     const node = e.target;
//     const newX = node.x(); const newY = node.y();

//     const shape = useBoardStore.getState().shapes.find(s => s.id === shapeId);
//     if (shape) {
//       const updatedShape = { ...shape, x: newX, y: newY };
//       console.log(`[Canvas] Drag ended. Broadcasting new coords for ${shapeId}: X:${newX}, Y:${newY}`);
//       useBoardStore.getState().updateShape(shapeId, { x: newX, y: newY });
//       socketService.socket?.emit('shape-update', { roomId, shape: updatedShape });
//     }
//   };

//   const renderShape = (shape: CanvasShape, isVolatile = false) => {
//     const isSelectTool = activeTool === 'select';
//     const isSelected = selectedShapeIds.includes(shape.id);
    
//     const commonProps = {
//       key: shape.id,
//       id: shape.id, // CRITICAL: Transformer requires the raw ID to find the node
//       stroke: shape.stroke,
//       strokeWidth: shape.strokeWidth || 3,
//       opacity: isVolatile ? 0.6 : 1,
//       // If we are actively selected, the Transformer handles the drag. If not, standard dragging applies.
//       draggable: isSelectTool && !isVolatile && isSelected,
//       onDragEnd: (e: any) => handleDragEnd(e, shape.id),
//       onMouseEnter: (e: any) => { if (isSelectTool) e.target.getStage().container().style.cursor = 'grab'; },
//       onMouseLeave: (e: any) => { if (isSelectTool) e.target.getStage().container().style.cursor = 'default'; },
//     };

//     if (shape.type === 'line') return <Line {...commonProps} points={shape.points || []} tension={0.5} lineCap="round" lineJoin="round" />;
//     if (shape.type === 'rectangle') return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width || 0} height={shape.height || 0} />;
//     if (shape.type === 'circle') return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.width || 0} />;
//     return null;
//   };

//   if (!isMounted || !user) return <div className="w-full h-screen flex items-center justify-center">Loading Canvas...</div>;

//   return (
//     <div className="w-full h-screen overflow-hidden bg-gray-50" style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}>
//       <Stage width={dimensions.width} height={dimensions.height} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}>
//         <Layer ref={layerRef}>
//           {shapes.map((shape) => renderShape(shape))}
          
//           {/* The Transformer visually groups selected items and allows dragging them as one entity */}
//           <Transformer 
//             ref={trRef} 
//             // We disable resize/rotate for this MVP to avoid scale matrix networking complexities
//             resizeEnabled={false} 
//             rotateEnabled={false} 
//             borderStroke="#0096FF" 
//             borderStrokeWidth={2}
//           />

//           {/* Render the transparent blue Marquee Box */}
//           {selectionBox?.visible && (
//             <Rect
//               x={Math.min(selectionBox.x1, selectionBox.x2)}
//               y={Math.min(selectionBox.y1, selectionBox.y2)}
//               width={Math.abs(selectionBox.x2 - selectionBox.x1)}
//               height={Math.abs(selectionBox.y2 - selectionBox.y1)}
//               fill="rgba(0, 161, 255, 0.2)"
//               stroke="#00A1FF"
//               strokeWidth={1}
//             />
//           )}
//         </Layer>
        
//         <Layer>
//           {Object.values(remoteShapes).map((shape) => renderShape(shape, true))}
//           {activeShape && renderShape(activeShape)}
//         </Layer>
//       </Stage>
//     </div>
//   );
// }





// //text feature'use client';'use client';

// import { useEffect, useState, useRef, Fragment } from 'react';
// import { Stage, Layer, Line, Rect, Circle, Transformer, Text, Image as KonvaImage} from 'react-konva';
// import { useBoardStore, CanvasShape } from '@/store/boardStore';
// import { v4 as uuidv4 } from 'uuid';
// import { socketService } from '@/services/socketService';
// import { useUser } from '@stackframe/stack';
// import { Image as ImageIcon } from 'lucide-react'; // Also grab this icon for the upload button
// import { Share, Download } from 'lucide-react';

// interface CanvasBoardProps {
//   roomId: string;
// }

// const USER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// // --- NEW: Async Image Loader for Konva ---
// const URLImage = ({ shape, commonProps }: { shape: CanvasShape, commonProps: any }) => {
//   const [img, setImg] = useState<HTMLImageElement | null>(null);

//   useEffect(() => {
//     if (shape.url) {
//       const imageObj = new window.Image();
//       imageObj.crossOrigin = "Anonymous"; // Critical: prevents CORS errors when exporting the canvas later
//       imageObj.src = shape.url;
//       imageObj.onload = () => setImg(imageObj);
//     }
//   }, [shape.url]);

//   if (!img) return null; // Don't render until the image finishes downloading

//   return (
//     <KonvaImage 
//       {...commonProps}
//       image={img}
//       x={shape.x}
//       y={shape.y}
//       width={shape.width || img.width}
//       height={shape.height || img.height}
//     />
//   );
// };

// export default function CanvasBoard({ roomId }: CanvasBoardProps) {
//   const user = useUser({ or: 'redirect' });
//   const [isMounted, setIsMounted] = useState(false);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   const {
//     shapes, addShape, activeTool, strokeColor, strokeWidth, 
//     selectedShapeIds, setSelectedShapeIds,
//     fontSize, isBold, isItalic, isUnderline,
//     isReadOnly, setIsReadOnly
//   } = useBoardStore();
  
//   const [activeShape, setActiveShape] = useState<CanvasShape | null>(null);
//   const isDrawing = useRef(false);
//   const [remoteShapes, setRemoteShapes] = useState<{ [userId: string]: CanvasShape }>({});
//   const [selectionBox, setSelectionBox] = useState<{ visible: boolean, x1: number, y1: number, x2: number, y2: number } | null>(null);
  
//   const [textInput, setTextInput] = useState<{ id?: string, x: number, y: number, value: string } | null>(null);
//   const lastSavedState = useRef<string>('[]');

//   // --- Board Info & Live Presence States ---
//   const [boardName, setBoardName] = useState<string>("Untitled Board");
//   const [remoteCursors, setRemoteCursors] = useState<{ [userId: string]: { x: number, y: number, name: string, color: string } }>({});
  
//   // --- Sharing States ---
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [isOwner, setIsOwner] = useState(false);
//   const [copySuccess, setCopySuccess] = useState(false);
//   const [accessMode, setAccessMode] = useState<'RESTRICTED' | 'VIEW' | 'EDIT'>('RESTRICTED');

//   const localUserColor = useRef(USER_COLORS[(user?.id?.length || 0) % USER_COLORS.length]);
//   const localUserName = user?.displayName || user?.primaryEmail?.split('@')[0] || 'Anonymous';

//   const stageRef = useRef<any>(null);
//   const layerRef = useRef<any>(null);
//   const trRef = useRef<any>(null);

//   useEffect(() => {
//     if (trRef.current && layerRef.current) {
//       const nodes = selectedShapeIds.map((id) => layerRef.current.findOne(`#${id}`)).filter(Boolean);
//       trRef.current.nodes(nodes);
//       trRef.current.getLayer().batchDraw();
//     }
//   }, [selectedShapeIds, shapes]);

//   // --- 1. Initialization & Network Sockets ---
//   useEffect(() => {
//     if (!user) return;
//     setIsMounted(true);
//     setDimensions({ width: window.innerWidth, height: window.innerHeight });

//     const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', handleResize);

//     const initBoard = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/api/v1/room/${roomId}`, { 
//           method: 'GET',
//           credentials: 'include',
//         });
        
//         if (response.ok) {
//           const result = await response.json();
//           const incomingData = result.room?.data || result.data || [];
//           const incomingName = result.room?.name || "Untitled Board";
          
//           // RBAC LOGIC (Role Based Access Control)
//           const isUserOwner = result.room?.ownerId === user.id;
//           setIsOwner(isUserOwner);

//           if (!result.room?.isPublic) setAccessMode('RESTRICTED');
//           else if (result.room?.allowEdits) setAccessMode('EDIT');
//           else setAccessMode('VIEW');

//           // FIREWALL: Lock down the canvas if they aren't the owner and edits aren't allowed
//           const readOnly = !isUserOwner && !result.room?.allowEdits;
//           setIsReadOnly(readOnly);
          
//           if (readOnly) useBoardStore.getState().setActiveTool('select');

//           useBoardStore.getState().setInitialShapes(incomingData);
//           setBoardName(incomingName);
//           lastSavedState.current = JSON.stringify(incomingData);
//         } else if (response.status === 403) {
//           alert("This board is restricted.");
//           window.location.href = '/dashboard';
//         }
//       } catch (err) {
//         console.error("🔴 [Canvas] Failed to load initial board state:", err);
//       }
//     };

//     initBoard();

//     const socket = socketService.connect(roomId, user.id);
//     socket?.on('draw-stream-update', (data) => setRemoteShapes((prev) => ({ ...prev, [data.userId]: data.shape })));
//     socket?.on('draw-update', (data) => {
//       if (data.action === 'add') {
//         addShape(data.shape); 
//         setRemoteShapes((prev) => { const newState = { ...prev }; delete newState[data.userId]; return newState; });
//       }
//     });
//     socket?.on('sync-full-state', (newShapes) => useBoardStore.getState().forceReplaceBoard(newShapes));
//     socket?.on('shape-updated', (updatedShape) => useBoardStore.getState().updateShape(updatedShape.id, updatedShape));

//     socket?.on('cursor-update', (data) => {
//       setRemoteCursors((prev) => ({ ...prev, [data.userId]: { x: data.x, y: data.y, name: data.name, color: data.color } }));
//     });

//     socket?.on('user-left', (data) => {
//       setRemoteCursors((prev) => { const newState = { ...prev }; delete newState[data.userId]; return newState; });
//     });

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       socketService.disconnect(roomId, user.id);
//       socket?.off('draw-stream-update'); socket?.off('draw-update'); socket?.off('sync-full-state'); 
//       socket?.off('shape-updated'); socket?.off('cursor-update'); socket?.off('user-left');
//     };
//   }, [roomId, user, addShape]);

//   // --- 2. The 5-Second Debouncer ---
//   useEffect(() => {
//     if (!user || isReadOnly) return; // Never save if the user is a viewer

//     const saveInterval = setInterval(async () => {
//       const currentShapes = useBoardStore.getState().shapes;
//       const currentStringified = JSON.stringify(currentShapes);

//       if (currentStringified !== lastSavedState.current || lastSavedState.current === 'FORCE_SAVE') {
//         const thumbnailDataUrl = stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg', quality: 0.5 }) : null;

//         try {
//           const response = await fetch(`http://localhost:8080/api/v1/room/${roomId}`, {
//             method: 'POST',
//             credentials: 'include',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ shapes: currentShapes, name: boardName, thumbnail: thumbnailDataUrl })
//           });

//           if (response.ok) lastSavedState.current = currentStringified;
//         } catch (err) {
//           console.error("🔴 [Debouncer] Network failure during save:", err);
//         }
//       }
//     }, 5000);

//     return () => clearInterval(saveInterval);
//   }, [roomId, user, boardName, isReadOnly]);


//   // --- Event Handlers ---
//   const handleAccessChange = async (mode: 'RESTRICTED' | 'VIEW' | 'EDIT') => {
//     setAccessMode(mode);
//     const isPublic = mode !== 'RESTRICTED';
//     const allowEdits = mode === 'EDIT';

//     try {
//       await fetch(`http://localhost:8080/api/v1/room/${roomId}/visibility`, { 
//         method: 'PUT',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isPublic, allowEdits })
//       });
//     } catch (err) {
//       console.error("Failed to update access");
//     }
//   };

//   const handleCopyLink = () => {
//     navigator.clipboard.writeText(window.location.href);
//     setCopySuccess(true);
//     setTimeout(() => setCopySuccess(false), 2000);
//   };

//   // --- NEW: Cloudinary Upload Engine ---
//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || isReadOnly) return;

//     try {
//       // 1. Pack the physical file
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('upload_preset', 'syncspace'); // Your exact preset

//       // 2. Blast it directly to Cloudinary
//       const res = await fetch('https://api.cloudinary.com/v1_1/dnyynbwea/image/upload', { // Your exact cloud name
//         method: 'POST',
//         body: formData
//       });
      
//       const data = await res.json();
//       if (!data.secure_url) throw new Error("Upload failed");

//       // 3. Create the lightweight JSON shape
//       const newImageShape: CanvasShape = {
//         id: uuidv4(),
//         type: 'image',
//         url: data.secure_url,
//         x: window.innerWidth / 2 - 150, // Drop it in the center of the screen
//         y: window.innerHeight / 2 - 150,
//         width: 300, 
//         height: 300,
//         stroke: 'transparent',
//         strokeWidth: 0
//       };

//       // 4. Save to local memory and broadcast to WebSockets
//       addShape(newImageShape);
//       if (socketService.socket && user) {
//         socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: newImageShape });
//       }

//     } catch (error) {
//       console.error("Cloudinary upload failed:", error);
//       alert("Failed to upload image.");
//     }
//   };

//   const handleExport = () => {
//     if (stageRef.current) {
//       const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); 
//       const link = document.createElement('a');
//       link.download = `${boardName}.png`;
//       link.href = uri;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     if (!textInput || !textInput.id || !user || isReadOnly) return;
//     const newValue = e.target.value;
//     setTextInput({ ...textInput, value: newValue });

//     let style: CanvasShape['fontStyle'] = 'normal';
//     if (isBold && isItalic) style = 'italic bold';
//     else if (isBold) style = 'bold';
//     else if (isItalic) style = 'italic';
//     const decoration: 'underline' | 'empty' = isUnderline ? 'underline' : 'empty';

//     const volatileTextShape: CanvasShape = {
//       id: textInput.id, type: 'text', x: textInput.x, y: textInput.y,
//       text: newValue, stroke: strokeColor, fontSize: fontSize, fontStyle: style, textDecoration: decoration
//     };

//     if (socketService.socket) {
//       socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: volatileTextShape });
//     }
//   };

//   const commitText = () => {
//     if (textInput && textInput.id && textInput.value.trim() !== '' && !isReadOnly) {
//       let style: CanvasShape['fontStyle'] = 'normal';
//       if (isBold && isItalic) style = 'italic bold';
//       else if (isBold) style = 'bold';
//       else if (isItalic) style = 'italic';
//       const decoration: 'underline' | 'empty' = isUnderline ? 'underline' : 'empty';

//       const finalShape: CanvasShape = {
//         id: textInput.id, type: 'text', x: textInput.x, y: textInput.y,
//         text: textInput.value, stroke: strokeColor, fontSize: fontSize, fontStyle: style, textDecoration: decoration
//       };

//       const isEditingExisting = shapes.some(s => s.id === textInput.id);

//       if (isEditingExisting) {
//         useBoardStore.getState().updateShape(textInput.id, finalShape);
//         if (socketService.socket && user) socketService.socket.emit('shape-update', { roomId, shape: finalShape });
//       } else {
//         addShape(finalShape);
//         if (socketService.socket && user) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: finalShape });
//       }
//     }
//     setTextInput(null);
//   };

//   const handleDblClick = (e: any) => {
//     if (isReadOnly) return;
//     const clickedNode = e.target;
//     if (clickedNode.getClassName() === 'Text') {
//       const shapeId = clickedNode.id();
//       const shape = shapes.find(s => s.id === shapeId);
//       if (shape) {
//         setTextInput({ id: shape.id, x: shape.x, y: shape.y, value: shape.text || '' });
//         setSelectedShapeIds([]); 
//       }
//     }
//   };

//   const handleMouseDown = (e: any) => {
//     if (isReadOnly) return; // FIREWALL
    
//     const pos = e.target.getStage().getPointerPosition();
//     const clickedNode = e.target;
    
//     if (textInput) {
//       commitText();
//       return; 
//     }

//     if (activeTool === 'text') {
//       if (clickedNode.getClassName() === 'Text') {
//         const shapeId = clickedNode.id();
//         const shape = shapes.find(s => s.id === shapeId);
//         if (shape) setTextInput({ id: shape.id, x: shape.x, y: shape.y, value: shape.text || '' });
//       } else {
//         setTextInput({ id: uuidv4(), x: pos.x, y: pos.y, value: '' });
//       }
//       setSelectedShapeIds([]);
//       return;
//     }

//     const clickedOnEmptySpace = clickedNode === clickedNode.getStage();
//     if (activeTool === 'select') {
//       if (clickedOnEmptySpace) {
//         setSelectionBox({ visible: true, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
//         setSelectedShapeIds([]); 
//       } else {
//         const clickedShapeId = clickedNode.id();
//         if (clickedShapeId && !selectedShapeIds.includes(clickedShapeId)) {
//           setSelectedShapeIds([clickedShapeId]);
//         }
//       }
//       return; 
//     }

//     isDrawing.current = true;
//     setSelectedShapeIds([]); 
//     setActiveShape({
//       id: uuidv4(), type: activeTool === 'pen' ? 'line' : activeTool as any,
//       x: pos.x, y: pos.y, width: 0, height: 0,
//       points: activeTool === 'pen' ? [pos.x, pos.y] : undefined,
//       stroke: strokeColor, strokeWidth: strokeWidth,
//     });
//   };

//   const handleMouseMove = (e: any) => {
//     const stage = e.target.getStage();
//     const point = stage.getPointerPosition();

//     if (socketService.socket && user) {
//       socketService.socket.emit('cursor-move', { 
//         roomId, userId: user.id, name: localUserName, color: localUserColor.current, x: point.x, y: point.y 
//       });
//     }

//     if (isReadOnly) return; // Viewers can send cursor pos, but can't draw

//     if (activeTool === 'select' && selectionBox?.visible) {
//       setSelectionBox({ ...selectionBox, x2: point.x, y2: point.y });
//       return;
//     }

//     if (!isDrawing.current || !activeShape || !user) return;
//     let updatedShape = { ...activeShape };

//     if (activeTool === 'pen') updatedShape.points = [...(activeShape.points || []), point.x, point.y];
//     else if (activeTool === 'rectangle') { updatedShape.width = point.x - activeShape.x; updatedShape.height = point.y - activeShape.y; }
//     else if (activeTool === 'circle') updatedShape.width = Math.sqrt(Math.pow(point.x - activeShape.x, 2) + Math.pow(point.y - activeShape.y, 2));

//     setActiveShape(updatedShape);
//     if (socketService.socket) socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: updatedShape });
//   };

//   const handleMouseUp = () => {
//     if (isReadOnly) return;

//     if (activeTool === 'select' && selectionBox?.visible) {
//       const boxMinX = Math.min(selectionBox.x1, selectionBox.x2);
//       const boxMaxX = Math.max(selectionBox.x1, selectionBox.x2);
//       const boxMinY = Math.min(selectionBox.y1, selectionBox.y2);
//       const boxMaxY = Math.max(selectionBox.y1, selectionBox.y2);

//       const selected = shapes.filter((shape) => {
//         let sMinX = shape.x, sMaxX = shape.x, sMinY = shape.y, sMaxY = shape.y;
//         if (shape.type === 'rectangle') { sMaxX = shape.x + (shape.width || 0); sMaxY = shape.y + (shape.height || 0); } 
//         else if (shape.type === 'circle') { const r = shape.width || 0; sMinX = shape.x - r; sMaxX = shape.x + r; sMinY = shape.y - r; sMaxY = shape.y + r; } 
//         else if (shape.type === 'line' && shape.points) {
//           const xs = shape.points.filter((_, i) => i % 2 === 0);
//           const ys = shape.points.filter((_, i) => i % 2 !== 0);
//           sMinX = Math.min(...xs); sMaxX = Math.max(...xs); sMinY = Math.min(...ys); sMaxY = Math.max(...ys);
//         }
//         return sMinX >= boxMinX && sMaxX <= boxMaxX && sMinY >= boxMinY && sMaxY <= boxMaxY;
//       });

//       setSelectedShapeIds(selected.map(s => s.id));
//       setSelectionBox(null); 
//       return;
//     }

//     if (!isDrawing.current) return;
//     isDrawing.current = false;
    
//     if (activeShape && user) {
//       addShape(activeShape);
//       if (socketService.socket) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: activeShape });
//     }
//     setActiveShape(null);
//   };

//   const handleDragEnd = (e: any, shapeId: string) => {
//     if (isReadOnly) return;
//     const node = e.target;
//     const newX = node.x(); const newY = node.y();

//     const shape = useBoardStore.getState().shapes.find(s => s.id === shapeId);
//     if (shape) {
//       const updatedShape = { ...shape, x: newX, y: newY };
//       useBoardStore.getState().updateShape(shapeId, { x: newX, y: newY });
//       socketService.socket?.emit('shape-update', { roomId, shape: updatedShape });
//     }
//   };

//   const renderShape = (shape: CanvasShape, isVolatile = false) => {
//     const isSelectTool = activeTool === 'select';
//     const isSelected = selectedShapeIds.includes(shape.id);
//     const isBeingEdited = textInput?.id === shape.id;

//     const commonProps = {
//       id: shape.id,
//       stroke: shape.stroke, 
//       strokeWidth: shape.strokeWidth || 3,
//       opacity: isBeingEdited ? 0 : (isVolatile ? 0.6 : 1), 
//       draggable: isSelectTool && !isVolatile && isSelected && !isReadOnly,
//       onDragEnd: (e: any) => handleDragEnd(e, shape.id),
//       onMouseEnter: (e: any) => { if (isSelectTool && !isReadOnly) e.target.getStage().container().style.cursor = 'grab'; },
//       onMouseLeave: (e: any) => { if (isSelectTool && !isReadOnly) e.target.getStage().container().style.cursor = 'default'; },
//     };

//     if (shape.type === 'line') return <Line {...commonProps} points={shape.points || []} tension={0.5} lineCap="round" lineJoin="round" />;
//     if (shape.type === 'rectangle') return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width || 0} height={shape.height || 0} />;
//     if (shape.type === 'circle') return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.width || 0} />;
//     if (shape.type === 'text') return <Text key={shape.id} {...commonProps} x={shape.x} y={shape.y} text={shape.text} fontSize={shape.fontSize || 24} fontStyle={shape.fontStyle || 'normal'} textDecoration={shape.textDecoration || 'empty'} fill={shape.stroke} strokeEnabled={false} />;
//     if (shape.type === 'image') return <URLImage key={shape.id} shape={shape} commonProps={commonProps} />;
//     return null;
//   };

//   if (!isMounted || !user) return <div className="w-full h-screen flex items-center justify-center">Loading Canvas...</div>;

//   const activeUsers = [
//     { id: user.id, name: localUserName, color: localUserColor.current },
//     ...Object.entries(remoteCursors).map(([id, data]) => ({ id, name: data.name, color: data.color }))
//   ];

//   return (
//     <div className="relative w-full h-screen overflow-hidden bg-gray-50" style={{ cursor: isReadOnly ? 'default' : activeTool === 'text' ? 'text' : activeTool === 'select' ? 'default' : 'crosshair' }}>
      
//       {/* Top Navigation Bar */}
//       <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
        
//         <div className="pointer-events-auto bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-gray-200 shadow-sm ml-16">
//           <input 
//             type="text" 
//             value={boardName}
//             onChange={(e) => setBoardName(e.target.value)}
//             disabled={!isOwner}
//             onBlur={() => { if (isOwner) lastSavedState.current = 'FORCE_SAVE'; }}
//             className="bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded-md px-3 py-1 text-sm font-bold outline-none transition-all w-48 lg:w-64 disabled:opacity-70"
//           />
//         </div>

//         <div className="pointer-events-auto flex items-center gap-3">
//           <div className="flex flex-row-reverse items-center">
//             {activeUsers.map((u, idx) => (
//               <div 
//                 key={u.id} title={u.name}
//                 className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm -ml-2"
//                 style={{ backgroundColor: u.color, zIndex: idx }}
//               >
//                 {u.name.charAt(0).toUpperCase()}
//               </div>
//             ))}
//           </div>

//           <div className="h-6 w-px bg-gray-300 mx-1"></div>

//           {/* --- NEW: Image Upload Button --- */}
//           {!isReadOnly && (
//             <label className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer">
//               <ImageIcon size={16} /> Image
//               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
//             </label>
//           )}

//           <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
//             <Share size={16} /> Share
//           </button>
          
//           <button onClick={handleExport} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border border-black text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
//             <Download size={16} /> Export
//           </button>
//         </div>
//       </div>

//       {/* Share Modal */}
//       {showShareModal && (
//         <div className="absolute inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl border border-gray-200 pointer-events-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">Share Board</h2>
//               <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-black">&times;</button>
//             </div>
            
//             {isOwner ? (
//               <div className="mb-6">
//                 <label className="block text-sm font-bold text-gray-700 mb-2">General Access</label>
//                 <select 
//                   value={accessMode}
//                   onChange={(e) => handleAccessChange(e.target.value as 'RESTRICTED' | 'VIEW' | 'EDIT')}
//                   className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
//                 >
//                   <option value="RESTRICTED">Restricted (Only you can access)</option>
//                   <option value="VIEW">Anyone with the link can View</option>
//                   <option value="EDIT">Anyone with the link can Edit</option>
//                 </select>
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mb-6 border-l-4 border-blue-500 pl-3 bg-blue-50 py-2">
//                 You are a {isReadOnly ? 'Viewer' : 'Editor'} on this board. Only the owner can change access settings.
//               </p>
//             )}
            
//             <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
//               <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="bg-transparent outline-none text-sm text-gray-600 w-full" />
//               <button onClick={handleCopyLink} disabled={accessMode === 'RESTRICTED' && isOwner} className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap hover:bg-gray-800 disabled:opacity-50">
//                 {copySuccess ? 'Copied!' : 'Copy Link'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Live Cursors */}
//       {Object.entries(remoteCursors).map(([id, cursor]) => (
//         <div key={id} style={{ position: 'absolute', top: cursor.y, left: cursor.x, zIndex: 9999, pointerEvents: 'none', transform: 'translate(-2px, -2px)' }} className="transition-all duration-75 ease-linear">
//           <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M0 0L24 12L12 16L8 36L0 0Z" fill={cursor.color} stroke="white" strokeWidth="2" strokeLinejoin="round"/>
//           </svg>
//           <div className="px-2 py-1 rounded-md text-white text-xs font-bold mt-1 shadow-md whitespace-nowrap" style={{ backgroundColor: cursor.color, width: 'max-content' }}>
//             {cursor.name}
//           </div>
//         </div>
//       ))}

//       {textInput && !isReadOnly && (
//         <textarea
//           autoFocus value={textInput.value} onChange={handleTextChange}
//           style={{
//             position: 'absolute', top: textInput.y + 'px', left: textInput.x + 'px', color: strokeColor, fontSize: fontSize + 'px', fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textDecoration: isUnderline ? 'underline' : 'none', background: 'transparent', border: '1px dashed #000', outline: 'none', padding: 0, margin: 0, resize: 'none', zIndex: 50, whiteSpace: 'pre', fontFamily: 'sans-serif',
//           }}
//           onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.width = e.currentTarget.scrollWidth + 'px'; }}
//         />
//       )}

//       <Stage ref={stageRef} width={dimensions.width} height={dimensions.height} onDblClick={handleDblClick} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}>
//         <Layer ref={layerRef}>
//           {shapes.map((shape) => ( <Fragment key={shape.id}>{renderShape(shape)}</Fragment> ))}
//           <Transformer ref={trRef} resizeEnabled={false} rotateEnabled={false} borderStroke="#0096FF" borderStrokeWidth={2} />
//           {selectionBox?.visible && ( <Rect x={Math.min(selectionBox.x1, selectionBox.x2)} y={Math.min(selectionBox.y1, selectionBox.y2)} width={Math.abs(selectionBox.x2 - selectionBox.x1)} height={Math.abs(selectionBox.y2 - selectionBox.y1)} fill="rgba(0, 161, 255, 0.2)" stroke="#00A1FF" strokeWidth={1} /> )}
//         </Layer>
//         <Layer>
//           {Object.values(remoteShapes).map((shape) => ( <Fragment key={`remote-${shape.id}`}>{renderShape(shape, true)}</Fragment> ))}
//           {activeShape && renderShape(activeShape)}
//         </Layer>
//       </Stage>
//     </div>
//   );
// }


// //images
// 'use client';

// import { useEffect, useState, useRef, Fragment } from 'react';
// import { Stage, Layer, Line, Rect, Circle, Transformer, Text, Image as KonvaImage } from 'react-konva';
// import { useBoardStore, CanvasShape } from '@/store/boardStore';
// import { v4 as uuidv4 } from 'uuid';
// import { socketService } from '@/services/socketService';
// import { useUser } from '@stackframe/stack';
// import { Share, Download, Image as ImageIcon } from 'lucide-react';

// interface CanvasBoardProps {
//   roomId: string;
// }

// const USER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// // --- Async Image Loader for Konva ---
// const URLImage = ({ shape, commonProps }: { shape: CanvasShape, commonProps: any }) => {
//   const [img, setImg] = useState<HTMLImageElement | null>(null);

//   useEffect(() => {
//     if (shape.url) {
//       const imageObj = new window.Image();
//       imageObj.crossOrigin = "Anonymous"; 
//       imageObj.src = shape.url;
//       imageObj.onload = () => setImg(imageObj);
      
//     }
//   }, [shape.url]);

//   if (!img) return null; 

//   return (
//     <KonvaImage 
//       {...commonProps}
//       image={img}
//       x={shape.x}
//       y={shape.y}
//       width={shape.width || img.width}
//       height={shape.height || img.height}
//     />
//   );
// };

// export default function CanvasBoard({ roomId }: CanvasBoardProps) {
//   const user = useUser({ or: 'redirect' });
//   const [isMounted, setIsMounted] = useState(false);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   const {
//     shapes, addShape, activeTool, strokeColor, strokeWidth, 
//     selectedShapeIds, setSelectedShapeIds,
//     fontSize, isBold, isItalic, isUnderline,
//     isReadOnly, setIsReadOnly
//   } = useBoardStore();
  
//   const [activeShape, setActiveShape] = useState<CanvasShape | null>(null);
//   const isDrawing = useRef(false);
//   const [remoteShapes, setRemoteShapes] = useState<{ [userId: string]: CanvasShape }>({});
//   const [selectionBox, setSelectionBox] = useState<{ visible: boolean, x1: number, y1: number, x2: number, y2: number } | null>(null);
  
//   const [textInput, setTextInput] = useState<{ id?: string, x: number, y: number, value: string } | null>(null);
//   const lastSavedState = useRef<string>('[]');

//   const [boardName, setBoardName] = useState<string>("Untitled Board");
//   const [remoteCursors, setRemoteCursors] = useState<{ [userId: string]: { x: number, y: number, name: string, color: string } }>({});
  
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [isOwner, setIsOwner] = useState(false);
//   const [copySuccess, setCopySuccess] = useState(false);
//   const [accessMode, setAccessMode] = useState<'RESTRICTED' | 'VIEW' | 'EDIT'>('RESTRICTED');
//   const [isUploadingImage, setIsUploadingImage] = useState(false);

//   const localUserColor = useRef(USER_COLORS[(user?.id?.length || 0) % USER_COLORS.length]);
//   const localUserName = user?.displayName || user?.primaryEmail?.split('@')[0] || 'Anonymous';

//   const stageRef = useRef<any>(null);
//   const layerRef = useRef<any>(null);
//   const trRef = useRef<any>(null);

//   useEffect(() => {
//     if (trRef.current && layerRef.current) {
//       const nodes = selectedShapeIds.map((id) => layerRef.current.findOne(`#${id}`)).filter(Boolean);
//       trRef.current.nodes(nodes);
//       trRef.current.getLayer().batchDraw();
//     }
//   }, [selectedShapeIds, shapes]);

//   useEffect(() => {
//     if (!user) return;
//     setIsMounted(true);
//     setDimensions({ width: window.innerWidth, height: window.innerHeight });

//     const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', handleResize);

//     const initBoard = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/api/v1/room/${roomId}`, { 
//           method: 'GET',
//           credentials: 'include',
//         });
        
//         if (response.ok) {
//           const result = await response.json();
//           const incomingData = result.room?.data || result.data || [];
//           const incomingName = result.room?.name || "Untitled Board";
          
//           const isUserOwner = result.room?.ownerId === user.id;
//           setIsOwner(isUserOwner);

//           if (!result.room?.isPublic) setAccessMode('RESTRICTED');
//           else if (result.room?.allowEdits) setAccessMode('EDIT');
//           else setAccessMode('VIEW');

//           const readOnly = !isUserOwner && !result.room?.allowEdits;
//           setIsReadOnly(readOnly);
          
//           if (readOnly) useBoardStore.getState().setActiveTool('select');

//           useBoardStore.getState().setInitialShapes(incomingData);
//           setBoardName(incomingName);
//           lastSavedState.current = JSON.stringify(incomingData);
//         } else if (response.status === 403) {
//           alert("This board is restricted.");
//           window.location.href = '/dashboard';
//         }
//       } catch (err) {
//         console.error("🔴 [Canvas] Failed to load initial board state:", err);
//       }
//     };

//     initBoard();

//     const socket = socketService.connect(roomId, user.id);
//     socket?.on('draw-stream-update', (data) => setRemoteShapes((prev) => ({ ...prev, [data.userId]: data.shape })));
//     socket?.on('draw-update', (data) => {
//       if (data.action === 'add') {
//         addShape(data.shape); 
//         setRemoteShapes((prev) => { const newState = { ...prev }; delete newState[data.userId]; return newState; });
//       }
//     });
//     socket?.on('sync-full-state', (newShapes) => useBoardStore.getState().forceReplaceBoard(newShapes));
//     socket?.on('shape-updated', (updatedShape) => useBoardStore.getState().updateShape(updatedShape.id, updatedShape));
//     socket?.on('cursor-update', (data) => {
//       setRemoteCursors((prev) => ({ ...prev, [data.userId]: { x: data.x, y: data.y, name: data.name, color: data.color } }));
//     });
//     socket?.on('user-left', (data) => {
//       setRemoteCursors((prev) => { const newState = { ...prev }; delete newState[data.userId]; return newState; });
//     });
//     // Catch the wipe command
//     socket?.on('board-cleared', () => {
//       useBoardStore.getState().clearBoard();
//     });

//     // ... down in the return () => cleanup section:
//     socket?.off('board-cleared');

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       socketService.disconnect(roomId, user.id);
//       socket?.off('draw-stream-update'); socket?.off('draw-update'); socket?.off('sync-full-state'); 
//       socket?.off('shape-updated'); socket?.off('cursor-update'); socket?.off('user-left');
//     };
//   }, [roomId, user, addShape]);

//   useEffect(() => {
//     if (!user || isReadOnly) return;

//     const saveInterval = setInterval(async () => {
//       const currentShapes = useBoardStore.getState().shapes;
//       const currentStringified = JSON.stringify(currentShapes);

//       if (currentStringified !== lastSavedState.current || lastSavedState.current === 'FORCE_SAVE') {
//         const thumbnailDataUrl = stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg', quality: 0.5 }) : null;

//         try {
//           const response = await fetch(`http://localhost:8080/api/v1/room/${roomId}`, {
//             method: 'POST',
//             credentials: 'include',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ shapes: currentShapes, name: boardName, thumbnail: thumbnailDataUrl })
//           });

//           if (response.ok) lastSavedState.current = currentStringified;
//         } catch (err) {
//           console.error("🔴 [Debouncer] Network failure during save:", err);
//         }
//       }
//     }, 5000);

//     return () => clearInterval(saveInterval);
//   }, [roomId, user, boardName, isReadOnly]);


//   const handleAccessChange = async (mode: 'RESTRICTED' | 'VIEW' | 'EDIT') => {
//     setAccessMode(mode);
//     const isPublic = mode !== 'RESTRICTED';
//     const allowEdits = mode === 'EDIT';

//     try {
//       await fetch(`http://localhost:8080/api/v1/room/${roomId}/visibility`, { 
//         method: 'PUT',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isPublic, allowEdits })
//       });
//     } catch (err) {
//       console.error("Failed to update access");
//     }
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || isReadOnly) return;

//     setIsUploadingImage(true); 

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('upload_preset', 'syncspace');

//       const res = await fetch('https://api.cloudinary.com/v1_1/dnyynbwea/image/upload', {
//         method: 'POST',
//         body: formData
//       });
      
//       const data = await res.json();
//       if (!data.secure_url) throw new Error("Upload failed");

//       const originalWidth = data.width;
//       const originalHeight = data.height;

//       const newImageShape: CanvasShape = {
//         id: uuidv4(),
//         type: 'image',
//         url: data.secure_url,
//         x: window.innerWidth / 2 - (originalWidth / 2),
//         y: window.innerHeight / 2 - (originalHeight / 2),
//         width: originalWidth, 
//         height: originalHeight,
//         stroke: 'transparent',
//         strokeWidth: 0
//       };

//       addShape(newImageShape);
//       if (socketService.socket && user) {
//         socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: newImageShape });
//       }
//     } catch (error) {
//       console.error("Cloudinary upload failed:", error);
//       alert("Failed to upload image.");
//     } finally {
//       setIsUploadingImage(false); 
//       e.target.value = ''; 
//     }
//   };

//   const handleCopyLink = () => {
//     navigator.clipboard.writeText(window.location.href);
//     setCopySuccess(true);
//     setTimeout(() => setCopySuccess(false), 2000);
//   };

//   const handleExport = () => {
//     if (stageRef.current) {
//       const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); 
//       const link = document.createElement('a');
//       link.download = `${boardName}.png`;
//       link.href = uri;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     if (!textInput || !textInput.id || !user || isReadOnly) return;
//     const newValue = e.target.value;
//     setTextInput({ ...textInput, value: newValue });

//     let style: CanvasShape['fontStyle'] = 'normal';
//     if (isBold && isItalic) style = 'italic bold';
//     else if (isBold) style = 'bold';
//     else if (isItalic) style = 'italic';
//     const decoration: 'underline' | 'empty' = isUnderline ? 'underline' : 'empty';

//     const volatileTextShape: CanvasShape = {
//       id: textInput.id, type: 'text', x: textInput.x, y: textInput.y,
//       text: newValue, stroke: strokeColor, fontSize: fontSize, fontStyle: style, textDecoration: decoration
//     };

//     if (socketService.socket) {
//       socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: volatileTextShape });
//     }
//   };

//   const commitText = () => {
//     if (textInput && textInput.id && textInput.value.trim() !== '' && !isReadOnly) {
//       let style: CanvasShape['fontStyle'] = 'normal';
//       if (isBold && isItalic) style = 'italic bold';
//       else if (isBold) style = 'bold';
//       else if (isItalic) style = 'italic';
//       const decoration: 'underline' | 'empty' = isUnderline ? 'underline' : 'empty';

//       const finalShape: CanvasShape = {
//         id: textInput.id, type: 'text', x: textInput.x, y: textInput.y,
//         text: textInput.value, stroke: strokeColor, fontSize: fontSize, fontStyle: style, textDecoration: decoration
//       };

//       const isEditingExisting = shapes.some(s => s.id === textInput.id);

//       if (isEditingExisting) {
//         useBoardStore.getState().updateShape(textInput.id, finalShape);
//         if (socketService.socket && user) socketService.socket.emit('shape-update', { roomId, shape: finalShape });
//       } else {
//         addShape(finalShape);
//         if (socketService.socket && user) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: finalShape });
//       }
//     }
//     setTextInput(null);
//   };

//   const handleDblClick = (e: any) => {
//     if (isReadOnly) return;
//     const clickedNode = e.target;
//     if (clickedNode.getClassName() === 'Text') {
//       const shapeId = clickedNode.id();
//       const shape = shapes.find(s => s.id === shapeId);
//       if (shape) {
//         setTextInput({ id: shape.id, x: shape.x, y: shape.y, value: shape.text || '' });
//         setSelectedShapeIds([]); 
//       }
//     }
//   };

//   const handleMouseDown = (e: any) => {
//     if (isReadOnly) return; 
    
//     const pos = e.target.getStage().getPointerPosition();
//     const clickedNode = e.target;
    
//     if (textInput) {
//       commitText();
//       return; 
//     }

//     if (activeTool === 'text') {
//       if (clickedNode.getClassName() === 'Text') {
//         const shapeId = clickedNode.id();
//         const shape = shapes.find(s => s.id === shapeId);
//         if (shape) setTextInput({ id: shape.id, x: shape.x, y: shape.y, value: shape.text || '' });
//       } else {
//         setTextInput({ id: uuidv4(), x: pos.x, y: pos.y, value: '' });
//       }
//       setSelectedShapeIds([]);
//       return;
//     }

//     const clickedOnEmptySpace = clickedNode === clickedNode.getStage();
//     if (activeTool === 'select') {
//       if (clickedOnEmptySpace) {
//         setSelectionBox({ visible: true, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
//         setSelectedShapeIds([]); 
//       } else {
//         const clickedShapeId = clickedNode.id();
//         if (clickedShapeId && !selectedShapeIds.includes(clickedShapeId)) {
//           setSelectedShapeIds([clickedShapeId]);
//         }
//       }
//       return; 
//     }

//     isDrawing.current = true;
//     setSelectedShapeIds([]); 
//     setActiveShape({
//       id: uuidv4(), type: activeTool === 'pen' ? 'line' : activeTool as any,
//       x: pos.x, y: pos.y, width: 0, height: 0,
//       points: activeTool === 'pen' ? [pos.x, pos.y] : undefined,
//       stroke: strokeColor, strokeWidth: strokeWidth,
//     });
//   };

//   const handleMouseMove = (e: any) => {
//     const stage = e.target.getStage();
//     const point = stage.getPointerPosition();

//     if (socketService.socket && user) {
//       socketService.socket.emit('cursor-move', { 
//         roomId, userId: user.id, name: localUserName, color: localUserColor.current, x: point.x, y: point.y 
//       });
//     }

//     if (isReadOnly) return; 

//     if (activeTool === 'select' && selectionBox?.visible) {
//       setSelectionBox({ ...selectionBox, x2: point.x, y2: point.y });
//       return;
//     }

//     if (!isDrawing.current || !activeShape || !user) return;
//     let updatedShape = { ...activeShape };

//     if (activeTool === 'pen') updatedShape.points = [...(activeShape.points || []), point.x, point.y];
//     else if (activeTool === 'rectangle') { updatedShape.width = point.x - activeShape.x; updatedShape.height = point.y - activeShape.y; }
//     else if (activeTool === 'circle') updatedShape.width = Math.sqrt(Math.pow(point.x - activeShape.x, 2) + Math.pow(point.y - activeShape.y, 2));

//     setActiveShape(updatedShape);
//     if (socketService.socket) socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: updatedShape });
//   };

//   const handleMouseUp = () => {
//     if (isReadOnly) return;

//     if (activeTool === 'select' && selectionBox?.visible) {
//       const boxMinX = Math.min(selectionBox.x1, selectionBox.x2);
//       const boxMaxX = Math.max(selectionBox.x1, selectionBox.x2);
//       const boxMinY = Math.min(selectionBox.y1, selectionBox.y2);
//       const boxMaxY = Math.max(selectionBox.y1, selectionBox.y2);

//       const selected = shapes.filter((shape) => {
//         let sMinX = shape.x, sMaxX = shape.x, sMinY = shape.y, sMaxY = shape.y;
//         if (shape.type === 'rectangle') { sMaxX = shape.x + (shape.width || 0); sMaxY = shape.y + (shape.height || 0); } 
//         else if (shape.type === 'circle') { const r = shape.width || 0; sMinX = shape.x - r; sMaxX = shape.x + r; sMinY = shape.y - r; sMaxY = shape.y + r; } 
//         else if (shape.type === 'line' && shape.points) {
//           const xs = shape.points.filter((_, i) => i % 2 === 0);
//           const ys = shape.points.filter((_, i) => i % 2 !== 0);
//           sMinX = Math.min(...xs); sMaxX = Math.max(...xs); sMinY = Math.min(...ys); sMaxY = Math.max(...ys);
//         }
//         return sMinX >= boxMinX && sMaxX <= boxMaxX && sMinY >= boxMinY && sMaxY <= boxMaxY;
//       });

//       setSelectedShapeIds(selected.map(s => s.id));
//       setSelectionBox(null); 
//       return;
//     }

//     if (!isDrawing.current) return;
//     isDrawing.current = false;
    
//     if (activeShape && user) {
//       addShape(activeShape);
//       if (socketService.socket) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: activeShape });
//     }
//     setActiveShape(null);
//   };

//   const handleDragEnd = (e: any, shapeId: string) => {
//     if (isReadOnly) return;
//     const node = e.target;
//     const newX = node.x(); const newY = node.y();

//     const shape = useBoardStore.getState().shapes.find(s => s.id === shapeId);
//     if (shape) {
//       const updatedShape = { ...shape, x: newX, y: newY };
//       useBoardStore.getState().updateShape(shapeId, { x: newX, y: newY });
//       socketService.socket?.emit('shape-update', { roomId, shape: updatedShape });
//     }
//   };

//   // --- NEW: Physics Engine For Resizing ---
//   const handleTransformEnd = (e: any, shapeId: string) => {
//     if (isReadOnly) return;
//     const node = e.target;
    
//     // Grab the scale multipliers
//     const scaleX = node.scaleX();
//     const scaleY = node.scaleY();

//     // Reset the internal scale immediately to prevent exponential growth loops
//     node.scaleX(1);
//     node.scaleY(1);

//     // Calculate the new true dimensions
//     const newWidth = Math.max(5, node.width() * scaleX);
//     const newHeight = Math.max(5, node.height() * scaleY);
//     const newX = node.x();
//     const newY = node.y();

//     const shape = useBoardStore.getState().shapes.find(s => s.id === shapeId);
//     if (shape) {
//       const updatedProps = { x: newX, y: newY, width: newWidth, height: newHeight };
//       useBoardStore.getState().updateShape(shapeId, updatedProps);
      
//       if (socketService.socket) {
//         socketService.socket.emit('shape-update', { roomId, shape: { ...shape, ...updatedProps } });
//       }
//     }
//   };

//   const renderShape = (shape: CanvasShape, isVolatile = false) => {
//     const isSelectTool = activeTool === 'select';
//     const isSelected = selectedShapeIds.includes(shape.id);
//     const isBeingEdited = textInput?.id === shape.id;

//     const commonProps = {
//       id: shape.id,
//       stroke: shape.stroke, 
//       strokeWidth: shape.strokeWidth || 3,
//       opacity: isBeingEdited ? 0 : (isVolatile ? 0.6 : 1), 
//       draggable: isSelectTool && !isVolatile && isSelected && !isReadOnly,
//       onDragEnd: (e: any) => handleDragEnd(e, shape.id),
//       onTransformEnd: (e: any) => handleTransformEnd(e, shape.id), // <-- Attaches Resize Engine
//       onMouseEnter: (e: any) => { if (isSelectTool && !isReadOnly) e.target.getStage().container().style.cursor = 'grab'; },
//       onMouseLeave: (e: any) => { if (isSelectTool && !isReadOnly) e.target.getStage().container().style.cursor = 'default'; },
//     };

//     if (shape.type === 'line') return <Line {...commonProps} points={shape.points || []} tension={0.5} lineCap="round" lineJoin="round" />;
//     if (shape.type === 'rectangle') return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width || 0} height={shape.height || 0} />;
//     if (shape.type === 'circle') return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.width || 0} />;
//     if (shape.type === 'text') return <Text key={shape.id} {...commonProps} x={shape.x} y={shape.y} text={shape.text} fontSize={shape.fontSize || 24} fontStyle={shape.fontStyle || 'normal'} textDecoration={shape.textDecoration || 'empty'} fill={shape.stroke} strokeEnabled={false} />;
//     if (shape.type === 'image') return <URLImage key={shape.id} shape={shape} commonProps={commonProps} />;
//     return null;
//   };

//   if (!isMounted || !user) return <div className="w-full h-screen flex items-center justify-center text-black font-semibold">Loading Canvas...</div>;

//   const activeUsers = [
//     { id: user.id, name: localUserName, color: localUserColor.current },
//     ...Object.entries(remoteCursors).map(([id, data]) => ({ id, name: data.name, color: data.color }))
//   ];

//   return (
//     <div className="relative w-full h-screen overflow-hidden bg-gray-50" style={{ cursor: isReadOnly ? 'default' : activeTool === 'text' ? 'text' : activeTool === 'select' ? 'default' : 'crosshair' }}>
      
//       {/* Top Navigation Bar */}
//       <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
        
//         <div className="pointer-events-auto bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-gray-200 shadow-sm ml-16">
//           <input 
//             type="text" 
//             value={boardName}
//             onChange={(e) => setBoardName(e.target.value)}
//             disabled={!isOwner}
//             onBlur={() => { if (isOwner) lastSavedState.current = 'FORCE_SAVE'; }}
//             className="text-black bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded-md px-3 py-1 text-sm font-bold outline-none transition-all w-48 lg:w-64 disabled:opacity-70"
//           />
//         </div>

//         <div className="pointer-events-auto flex items-center gap-3">
//           <div className="flex flex-row-reverse items-center">
//             {activeUsers.map((u, idx) => (
//               <div 
//                 key={u.id} title={u.name}
//                 className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm -ml-2"
//                 style={{ backgroundColor: u.color, zIndex: idx }}
//               >
//                 {u.name.charAt(0).toUpperCase()}
//               </div>
//             ))}
//           </div>

//           <div className="h-6 w-px bg-gray-300 mx-1"></div>

//           {/* FIX: Loading State UI is now clearly visible with black text */}
//           {!isReadOnly && (
//             <label className={`flex items-center gap-2 bg-white border border-gray-200 text-sm text-black font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer ${isUploadingImage ? 'bg-gray-100 opacity-60 cursor-wait' : 'hover:bg-gray-50'}`}>
//               <ImageIcon size={16} /> 
//               {isUploadingImage ? 'Uploading...' : 'Image'}
//               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
//             </label>
//           )}

//           <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 bg-white text-black hover:bg-gray-50 border border-gray-200 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
//             <Share size={16} /> Share
//           </button>
          
//           <button onClick={handleExport} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border border-black text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
//             <Download size={16} /> Export
//           </button>
//         </div>
//       </div>

//       {/* Share Modal */}
//       {showShareModal && (
//         <div className="absolute inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl border border-gray-200 pointer-events-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl text-black font-bold">Share Board</h2>
//               <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-black">&times;</button>
//             </div>
            
//             {isOwner ? (
//               <div className="mb-6">
//                 <label className="block text-sm font-bold text-gray-700 mb-2">General Access</label>
//                 <select 
//                   value={accessMode}
//                   onChange={(e) => handleAccessChange(e.target.value as 'RESTRICTED' | 'VIEW' | 'EDIT')}
//                   className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
//                 >
//                   <option value="RESTRICTED">Restricted (Only you can access)</option>
//                   <option value="VIEW">Anyone with the link can View</option>
//                   <option value="EDIT">Anyone with the link can Edit</option>
//                 </select>
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mb-6 border-l-4 border-blue-500 pl-3 bg-blue-50 py-2">
//                 You are a {isReadOnly ? 'Viewer' : 'Editor'} on this board. Only the owner can change access settings.
//               </p>
//             )}
            
//             <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
//               <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="bg-transparent outline-none text-sm text-gray-600 w-full" />
//               <button onClick={handleCopyLink} disabled={accessMode === 'RESTRICTED' && isOwner} className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap hover:bg-gray-800 disabled:opacity-50">
//                 {copySuccess ? 'Copied!' : 'Copy Link'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Live Cursors */}
//       {Object.entries(remoteCursors).map(([id, cursor]) => (
//         <div key={id} style={{ position: 'absolute', top: cursor.y, left: cursor.x, zIndex: 9999, pointerEvents: 'none', transform: 'translate(-2px, -2px)' }} className="transition-all duration-75 ease-linear">
//           <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M0 0L24 12L12 16L8 36L0 0Z" fill={cursor.color} stroke="white" strokeWidth="2" strokeLinejoin="round"/>
//           </svg>
//           <div className="px-2 py-1 rounded-md text-white text-xs font-bold mt-1 shadow-md whitespace-nowrap" style={{ backgroundColor: cursor.color, width: 'max-content' }}>
//             {cursor.name}
//           </div>
//         </div>
//       ))}

//       {textInput && !isReadOnly && (
//         <textarea
//           autoFocus value={textInput.value} onChange={handleTextChange}
//           style={{
//             position: 'absolute', top: textInput.y + 'px', left: textInput.x + 'px', color: strokeColor, fontSize: fontSize + 'px', fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textDecoration: isUnderline ? 'underline' : 'none', background: 'transparent', border: '1px dashed #000', outline: 'none', padding: 0, margin: 0, resize: 'none', zIndex: 50, whiteSpace: 'pre', fontFamily: 'sans-serif',
//           }}
//           onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.width = e.currentTarget.scrollWidth + 'px'; }}
//         />
//       )}

//       <Stage ref={stageRef} width={dimensions.width} height={dimensions.height} onDblClick={handleDblClick} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}>
//         <Layer ref={layerRef}>
//           {shapes.map((shape) => ( <Fragment key={shape.id}>{renderShape(shape)}</Fragment> ))}
          
//           {/* FIX: resizeEnabled is now true so you can scale images and rectangles */}
//           <Transformer ref={trRef} resizeEnabled={true} rotateEnabled={false} borderStroke="#0096FF" borderStrokeWidth={2} keepRatio={true} />
          
//           {selectionBox?.visible && ( <Rect x={Math.min(selectionBox.x1, selectionBox.x2)} y={Math.min(selectionBox.y1, selectionBox.y2)} width={Math.abs(selectionBox.x2 - selectionBox.x1)} height={Math.abs(selectionBox.y2 - selectionBox.y1)} fill="rgba(0, 161, 255, 0.2)" stroke="#00A1FF" strokeWidth={1} /> )}
//         </Layer>
//         <Layer>
//           {Object.values(remoteShapes).map((shape) => ( <Fragment key={`remote-${shape.id}`}>{renderShape(shape, true)}</Fragment> ))}
//           {activeShape && renderShape(activeShape)}
//         </Layer>
//       </Stage>
//     </div>
//   );
// }




//AI'use client';'use client';

import { useEffect, useState, useRef, Fragment } from 'react';
import { Stage, Layer, Line, Rect, Circle, Transformer, Text, Image as KonvaImage } from 'react-konva';
import { useBoardStore, CanvasShape } from '@/store/boardStore';
import { v4 as uuidv4 } from 'uuid';
import { socketService } from '@/services/socketService';
import { useUser } from '@stackframe/stack';
import { Share, Download, Image as ImageIcon, Sparkles, X, Send, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf'; // <-- PDF Compiler
import dagre from 'dagre';

interface CanvasBoardProps {
  roomId: string;
}

const USER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const URLImage = ({ shape, commonProps }: { shape: CanvasShape, commonProps: any }) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (shape.url) {
      const imageObj = new window.Image();
      imageObj.crossOrigin = "Anonymous"; 
      imageObj.src = shape.url;
      imageObj.onload = () => setImg(imageObj);
    }
  }, [shape.url]);

  if (!img) return null; 

  return (
    <KonvaImage {...commonProps} image={img} x={shape.x} y={shape.y} width={shape.width || img.width} height={shape.height || img.height} />
  );
};

export default function CanvasBoard({ roomId }: CanvasBoardProps) {
  const user = useUser({ or: 'redirect' });
  const [isMounted, setIsMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    shapes, addShape, activeTool, strokeColor, strokeWidth, 
    selectedShapeIds, setSelectedShapeIds,
    fontSize, isBold, isItalic, isUnderline,
    isReadOnly, setIsReadOnly, clearBoard, deleteShapes 
  } = useBoardStore();
  
  const [activeShape, setActiveShape] = useState<CanvasShape | null>(null);
  const isDrawing = useRef(false);
  const [remoteShapes, setRemoteShapes] = useState<{ [userId: string]: CanvasShape }>({});
  const [selectionBox, setSelectionBox] = useState<{ visible: boolean, x1: number, y1: number, x2: number, y2: number } | null>(null);
  
  const [textInput, setTextInput] = useState<{ id?: string, x: number, y: number, value: string } | null>(null);
  const lastSavedState = useRef<string>('[]');

  const [boardName, setBoardName] = useState<string>("Untitled Board");
  const [remoteCursors, setRemoteCursors] = useState<{ [userId: string]: { x: number, y: number, name: string, color: string } }>({});
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [accessMode, setAccessMode] = useState<'RESTRICTED' | 'VIEW' | 'EDIT'>('RESTRICTED');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- UPGRADED: AI Chat History States ---
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your AI architect. Ask me to draw a flowchart, or summarize what is currently on the board.' }
  ]);
  const [isAILoading, setIsAILoading] = useState(false);

  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const localUserColor = useRef(USER_COLORS[(user?.id?.length || 0) % USER_COLORS.length]);
  const localUserName = user?.displayName || user?.primaryEmail?.split('@')[0] || 'Anonymous';

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // --- Keyboard Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof Element && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      
      if (e.code === 'Space') setIsSpacePressed(true);
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isReadOnly && selectedShapeIds.length > 0) {
        deleteShapes(selectedShapeIds);
        if (socketService.socket) socketService.socket.emit('delete-shapes', { roomId, shapeIds: selectedShapeIds });
        setSelectedShapeIds([]); 
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedShapeIds, deleteShapes, roomId, isReadOnly]);


  useEffect(() => {
    if (trRef.current && layerRef.current) {
      const nodes = selectedShapeIds.map((id) => layerRef.current.findOne(`#${id}`)).filter(Boolean);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeIds, shapes]);

  useEffect(() => {
    if (!user) return;
    setIsMounted(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    const initBoard = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/room/${roomId}`, { method: 'GET', credentials: 'include' });
        
        if (response.ok) {
          const result = await response.json();
          const incomingData = result.room?.data || result.data || [];
          const incomingName = result.room?.name || "Untitled Board";
          
          const isUserOwner = result.room?.ownerId === user.id;
          setIsOwner(isUserOwner);

          if (!result.room?.isPublic) setAccessMode('RESTRICTED');
          else if (result.room?.allowEdits) setAccessMode('EDIT');
          else setAccessMode('VIEW');

          const readOnly = !isUserOwner && !result.room?.allowEdits;
          setIsReadOnly(readOnly);
          if (readOnly) useBoardStore.getState().setActiveTool('select');

          useBoardStore.getState().setInitialShapes(incomingData);
          setBoardName(incomingName);
          lastSavedState.current = JSON.stringify(incomingData);
        } else if (response.status === 403) {
          alert("This board is restricted.");
          window.location.href = '/dashboard';
        }
      } catch (err) {
        console.error("🔴 [Canvas] Failed to load initial board state:", err);
      }
    };

    initBoard();

    const socket = socketService.connect(roomId, user.id);
    socket?.on('draw-stream-update', (data) => setRemoteShapes((prev) => ({ ...prev, [data.userId]: data.shape })));
    socket?.on('draw-update', (data) => {
      if (data.action === 'add') {
        addShape(data.shape); 
        setRemoteShapes((prev) => { const newState = { ...prev }; delete newState[data.userId]; return newState; });
      }
    });
    socket?.on('sync-full-state', (newShapes) => useBoardStore.getState().forceReplaceBoard(newShapes));
    socket?.on('shape-updated', (updatedShape) => useBoardStore.getState().updateShape(updatedShape.id, updatedShape));
    socket?.on('cursor-update', (data) => { setRemoteCursors((prev) => ({ ...prev, [data.userId]: { x: data.x, y: data.y, name: data.name, color: data.color } })); });
    socket?.on('user-left', (data) => { setRemoteCursors((prev) => { const newState = { ...prev }; delete newState[data.userId]; return newState; }); });
    socket?.on('board-cleared', () => { clearBoard(); });
    socket?.on('shapes-deleted', (deletedIds: string[]) => { deleteShapes(deletedIds); });

    return () => {
      window.removeEventListener('resize', handleResize);
      socketService.disconnect(roomId, user.id);
      socket?.off('draw-stream-update'); socket?.off('draw-update'); socket?.off('sync-full-state'); 
      socket?.off('shape-updated'); socket?.off('cursor-update'); socket?.off('user-left');
      socket?.off('board-cleared');
      socket?.off('shapes-deleted'); 
    };
  }, [roomId, user, addShape, clearBoard, deleteShapes, setIsReadOnly]);

  // Debouncer
  useEffect(() => {
    if (!user || isReadOnly) return; 

    const saveInterval = setInterval(async () => {
      const currentShapes = useBoardStore.getState().shapes;
      const currentStringified = JSON.stringify(currentShapes);

      if (currentStringified !== lastSavedState.current || lastSavedState.current === 'FORCE_SAVE') {
        const thumbnailDataUrl = stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg', quality: 0.5 }) : null;

        try {
          const response = await fetch(`http://localhost:8080/api/v1/room/${roomId}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shapes: currentShapes, name: boardName, thumbnail: thumbnailDataUrl })
          });

          if (response.ok) lastSavedState.current = currentStringified;
        } catch (err) {
          console.error("🔴 [Debouncer] Network failure during save:", err);
        }
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [roomId, user, boardName, isReadOnly]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault(); 
    const stage = e.target.getStage();
    if (!stage) return;

    if (e.evt.ctrlKey) {
      const scaleBy = 1.05;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(newScale, 5));

      setStageScale(clampedScale);
      setStagePos({ x: pointer.x - mousePointTo.x * clampedScale, y: pointer.y - mousePointTo.y * clampedScale });
    } else {
      setStagePos({ x: stage.x() - e.evt.deltaX, y: stage.y() - e.evt.deltaY });
    }
  };

 // --- UPGRADED: The Dagre.js Layout Engine ---
// --- MASTER AI ENGINE (Dagre + Defensive Fallback) ---
  const handleAIRequest = async () => {
    if (!aiPrompt.trim() || isAILoading || isReadOnly) return;
    
    const userMessage = aiPrompt;
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsAILoading(true);
    setAiPrompt(""); 

    try {
      const imageBase64 = stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg', quality: 0.5 }) : null;

      const res = await fetch(`http://localhost:8080/api/v1/ai/generate`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, imageBase64 })
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "AI Generation Failed");

      const aiData = result.data;
      setChatHistory(prev => [...prev, { role: 'ai', text: aiData.message || "Generated successfully." }]);

      // ROUTE A: The Dagre.js Layout Engine (Eraser.io style)
      if (aiData.diagram && aiData.diagram.nodes && aiData.diagram.nodes.length > 0) {
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 }); 
        g.setDefaultEdgeLabel(() => ({}));

        aiData.diagram.nodes.forEach((node: any) => {
          const charWidth = Math.max(160, node.label.length * 10);
          g.setNode(node.id, { label: node.label, width: charWidth, height: 60 });
        });

        aiData.diagram.edges.forEach((edge: any) => {
          g.setEdge(edge.source, edge.target);
        });

        dagre.layout(g);

        const generatedShapes: CanvasShape[] = [];
        const offsetX = stagePos.x / stageScale; 
        const offsetY = stagePos.y / stageScale;
        const spawnX = (window.innerWidth / 2 - offsetX) - 200; 
        const spawnY = (window.innerHeight / 3 - offsetY);

       // Generate Eraser-Style Rectangles & Text
        g.nodes().forEach(v => {
          const node = g.node(v);
          if (!node) return;

          const trueX = (node.x - node.width / 2) + spawnX;
          const trueY = (node.y - node.height / 2) + spawnY;

          // The Dark Mode Eraser Box
          generatedShapes.push({
            id: uuidv4(), type: 'rectangle', x: trueX, y: trueY, 
            width: node.width, height: node.height,
            stroke: '#3b82f6',     // Bright blue border
            strokeWidth: 2,
            fill: '#1e293b',       // Deep slate/dark background
            cornerRadius: 8        // Rounded Eraser-style edges
          });

          // The Crisp White Monospace Text
          generatedShapes.push({
            id: uuidv4(), type: 'text', x: trueX + 20, y: trueY + 22,
            text: node.label, fontSize: 14, 
            stroke: '#f8fafc',     // White text color
            fontFamily: 'monospace' // Tech/Code aesthetic
          });
        });

        // Generate Curved Eraser-Style Lines
        g.edges().forEach(e => {
          const edge = g.edge(e);
          if (!edge) return;

          const points: number[] = [];
          edge.points.forEach(p => {
            points.push(p.x + spawnX);
            points.push(p.y + spawnY);
          });

          generatedShapes.push({
            id: uuidv4(), type: 'line', x: 0, y: 0, points,
            stroke: '#64748b',    // Subtle gray connecting lines
            strokeWidth: 2
            // Note: Your main renderShape already applies tension={0.5} which makes these lines beautifully curved.
          });
        });

        generatedShapes.forEach(shape => {
          addShape(shape);
          if (socketService.socket && user) {
            socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape });
          }
        });
      } 
      // ROUTE B: Fallback Defensive Engine (If AI ignores Dagre and spits out raw shapes)
      else if (aiData.shapes && Array.isArray(aiData.shapes)) {
        aiData.shapes.forEach((shape: CanvasShape) => {
          
          // THE FIX: Forcefully strip the AI's fake ID and assign a true mathematical UUID
          const safeId = uuidv4(); 

          const adjustedShape = { 
            ...shape, 
            id: safeId, // React duplicate key error destroyed here
            x: (shape.x - stagePos.x) / stageScale, 
            y: (shape.y - stagePos.y) / stageScale 
          };
          
          if(adjustedShape.type === 'line' && adjustedShape.points) {
            adjustedShape.points = [
              (adjustedShape.points[0] - stagePos.x) / stageScale, (adjustedShape.points[1] - stagePos.y) / stageScale,
              (adjustedShape.points[2] - stagePos.x) / stageScale, (adjustedShape.points[3] - stagePos.y) / stageScale
            ];
          }

          addShape(adjustedShape);
          if (socketService.socket && user) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: adjustedShape });
        });
      }
    } catch (error) {
      console.error("🔴 AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Network failure. Could not reach Gemini AI." }]);
    } finally {
      setIsAILoading(false);
    }
  };


  const handleAccessChange = async (mode: 'RESTRICTED' | 'VIEW' | 'EDIT') => {
    setAccessMode(mode);
    const isPublic = mode !== 'RESTRICTED';
    const allowEdits = mode === 'EDIT';

    try {
      await fetch(`http://localhost:8080/api/v1/room/${roomId}/visibility`, { 
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublic, allowEdits })
      });
    } catch (err) {
      console.error("Failed to update access");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isReadOnly) return;
    setIsUploadingImage(true); 

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'syncspace');

      const res = await fetch('https://api.cloudinary.com/v1_1/dnyynbwea/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      const originalWidth = data.width;
      const originalHeight = data.height;

      const newImageShape: CanvasShape = {
        id: uuidv4(), type: 'image', url: data.secure_url,
        x: (window.innerWidth / 2 - (originalWidth / 2) - stagePos.x) / stageScale,
        y: (window.innerHeight / 2 - (originalHeight / 2) - stagePos.y) / stageScale,
        width: originalWidth, height: originalHeight, stroke: 'transparent', strokeWidth: 0
      };

      addShape(newImageShape);
      if (socketService.socket && user) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: newImageShape });
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploadingImage(false); e.target.value = ''; 
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // --- EXPORT ENGINES ---
  const handleExportPNG = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); 
      const link = document.createElement('a');
      link.download = `${boardName}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportPDF = () => {
    if (stageRef.current) {
      // PDF requires jsPDF library
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/jpeg', quality: 0.8 });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [dimensions.width, dimensions.height] });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, dimensions.width, dimensions.height);
      pdf.save(`${boardName}.pdf`);
    }
  };

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
      id: textInput.id, type: 'text', x: textInput.x, y: textInput.y, text: newValue, stroke: strokeColor, fontSize: fontSize, fontStyle: style, textDecoration: decoration
    };

    if (socketService.socket) socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: volatileTextShape });
  };

  const commitText = () => {
    if (textInput && textInput.id && textInput.value.trim() !== '' && !isReadOnly) {
      let style: CanvasShape['fontStyle'] = 'normal';
      if (isBold && isItalic) style = 'italic bold';
      else if (isBold) style = 'bold';
      else if (isItalic) style = 'italic';
      const decoration: 'underline' | 'empty' = isUnderline ? 'underline' : 'empty';

      const finalShape: CanvasShape = {
        id: textInput.id, type: 'text', x: textInput.x, y: textInput.y, text: textInput.value, stroke: strokeColor, fontSize: fontSize, fontStyle: style, textDecoration: decoration
      };

      const isEditingExisting = shapes.some(s => s.id === textInput.id);

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
      const shape = shapes.find(s => s.id === shapeId);
      if (shape) {
        setTextInput({ id: shape.id, x: shape.x, y: shape.y, value: shape.text || '' });
        setSelectedShapeIds([]); 
      }
    }
  };

  const handleMouseDown = (e: any) => {
    if (isReadOnly || isSpacePressed) return; 
    
    const pos = e.target.getStage().getPointerPosition();
    const clickedNode = e.target;
    
    const trueX = (pos.x - stagePos.x) / stageScale;
    const trueY = (pos.y - stagePos.y) / stageScale;

    if (textInput) {
      commitText();
      return; 
    }

    if (activeTool === 'text') {
      if (clickedNode.getClassName() === 'Text') {
        const shapeId = clickedNode.id();
        const shape = shapes.find(s => s.id === shapeId);
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
      id: uuidv4(), type: activeTool === 'pen' ? 'line' : activeTool as any, x: trueX, y: trueY, width: 0, height: 0,
      points: activeTool === 'pen' ? [trueX, trueY] : undefined, stroke: strokeColor, strokeWidth: strokeWidth,
    });
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    const trueX = (pos.x - stagePos.x) / stageScale;
    const trueY = (pos.y - stagePos.y) / stageScale;

    if (socketService.socket && user) {
      socketService.socket.emit('cursor-move', { roomId, userId: user.id, name: localUserName, color: localUserColor.current, x: trueX, y: trueY });
    }

    if (isReadOnly || isSpacePressed) return; 

    if (activeTool === 'select' && selectionBox?.visible) {
      setSelectionBox({ ...selectionBox, x2: trueX, y2: trueY });
      return;
    }

    if (!isDrawing.current || !activeShape || !user) return;
    let updatedShape = { ...activeShape };

    if (activeTool === 'pen') updatedShape.points = [...(activeShape.points || []), trueX, trueY];
    else if (activeTool === 'rectangle') { updatedShape.width = trueX - activeShape.x; updatedShape.height = trueY - activeShape.y; }
    else if (activeTool === 'circle') updatedShape.width = Math.sqrt(Math.pow(trueX - activeShape.x, 2) + Math.pow(trueY - activeShape.y, 2));

    setActiveShape(updatedShape);
    if (socketService.socket) socketService.socket.emit('draw-stream', { roomId, userId: user.id, shape: updatedShape });
  };

const handleMouseUp = () => {
    if (isReadOnly || isSpacePressed) return;

    if (activeTool === 'select' && selectionBox?.visible) {
      // ... keep your existing selection logic here ...
      const boxMinX = Math.min(selectionBox.x1, selectionBox.x2);
      const boxMaxX = Math.max(selectionBox.x1, selectionBox.x2);
      const boxMinY = Math.min(selectionBox.y1, selectionBox.y2);
      const boxMaxY = Math.max(selectionBox.y1, selectionBox.y2);

      const selected = shapes.filter((shape) => {
        let sMinX = shape.x, sMaxX = shape.x, sMinY = shape.y, sMaxY = shape.y;
        if (shape.type === 'rectangle') { sMaxX = shape.x + (shape.width || 0); sMaxY = shape.y + (shape.height || 0); } 
        else if (shape.type === 'circle') { const r = shape.width || 0; sMinX = shape.x - r; sMaxX = shape.x + r; sMinY = shape.y - r; sMaxY = shape.y + r; } 
        else if (shape.type === 'line' && shape.points) {
          const xs = shape.points.filter((_, i) => i % 2 === 0);
          const ys = shape.points.filter((_, i) => i % 2 !== 0);
          sMinX = Math.min(...xs); sMaxX = Math.max(...xs); sMinY = Math.min(...ys); sMaxY = Math.max(...ys);
        }
        return sMinX >= boxMinX && sMaxX <= boxMaxX && sMinY >= boxMinY && sMaxY <= boxMaxY;
      });

      setSelectedShapeIds(selected.map(s => s.id));
      setSelectionBox(null); 
      return;
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (activeShape && user) {
      let finalShape = { ...activeShape };

      // FIX: The Geometry Normalizer. This prevents the "Exploding White Box" bug.
      if (finalShape.type === 'rectangle') {
        if ((finalShape.width || 0) < 0) {
          finalShape.x += (finalShape.width || 0);
          finalShape.width = Math.abs(finalShape.width || 0);
        }
        if ((finalShape.height || 0) < 0) {
          finalShape.y += (finalShape.height || 0);
          finalShape.height = Math.abs(finalShape.height || 0);
        }
      } else if (finalShape.type === 'circle') {
        // Ensure circle radius is always strictly positive
        finalShape.width = Math.abs(finalShape.width || 0); 
      }

      addShape(finalShape);
      if (socketService.socket) socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: finalShape });
    }
    setActiveShape(null);
  };
  const handleDragEnd = (e: any, shapeId: string) => {
    if (isReadOnly) return;
    const node = e.target;
    const newX = node.x(); const newY = node.y();

    const shape = useBoardStore.getState().shapes.find(s => s.id === shapeId);
    if (shape) {
      const updatedShape = { ...shape, x: newX, y: newY };
      useBoardStore.getState().updateShape(shapeId, { x: newX, y: newY });
      socketService.socket?.emit('shape-update', { roomId, shape: updatedShape });
    }
  };

const handleTransformEnd = (e: any, shapeId: string) => {
    if (isReadOnly) return;
    const node = e.target;
    
    // 1. Capture the raw scaling multipliers
    const scaleX = node.scaleX(); 
    const scaleY = node.scaleY();
    
    // 2. Reset visual scale to 1 immediately to prevent compound visual distortion
    node.scaleX(1); 
    node.scaleY(1);

    const shape = useBoardStore.getState().shapes.find(s => s.id === shapeId);
    if (shape) {
      let newX = node.x();
      let newY = node.y();
      let newWidth = node.width() * scaleX;
      let newHeight = node.height() * scaleY;

      // 3. GEOMETRY NORMALIZER: Fix origin if the user flipped the shape inside-out
      if (newWidth < 0) {
        newX += newWidth;
        newWidth = Math.abs(newWidth);
      }
      if (newHeight < 0) {
        newY += newHeight;
        newHeight = Math.abs(newHeight);
      }

      let updatedProps: any = { x: newX, y: newY };

      // 4. Apply absolute bounds (minimum 5x5)
      if (shape.type === 'circle') {
        const maxScale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
        updatedProps.width = Math.max(5, (shape.width || 0) * maxScale); // width acts as radius
      } else {
        updatedProps.width = Math.max(5, newWidth);
        updatedProps.height = Math.max(5, newHeight);
      }

      // 5. Save to global memory and broadcast
      useBoardStore.getState().updateShape(shapeId, updatedProps);
      if (socketService.socket) {
        socketService.socket.emit('shape-update', { roomId, shape: { ...shape, ...updatedProps } });
      }
    }
  };

  const renderShape = (shape: CanvasShape, isVolatile = false) => {
    const isSelectTool = activeTool === 'select';
    const isSelected = selectedShapeIds.includes(shape.id);
    const isBeingEdited = textInput?.id === shape.id;

    const commonProps = {
      id: shape.id, stroke: shape.stroke, strokeWidth: shape.strokeWidth || 3,
      opacity: isBeingEdited ? 0 : (isVolatile ? 0.6 : 1), 
      draggable: isSelectTool && !isVolatile && isSelected && !isReadOnly && !isSpacePressed,
      onDragEnd: (e: any) => handleDragEnd(e, shape.id), onTransformEnd: (e: any) => handleTransformEnd(e, shape.id), 
      onMouseEnter: (e: any) => { if (isSelectTool && !isReadOnly && !isSpacePressed) e.target.getStage().container().style.cursor = 'grab'; },
      onMouseLeave: (e: any) => { if (isSelectTool && !isReadOnly && !isSpacePressed) e.target.getStage().container().style.cursor = 'default'; },
    };

    if (shape.type === 'line') return <Line {...commonProps} points={shape.points || []} tension={0.5} lineCap="round" lineJoin="round" />;
if (shape.type === 'rectangle') return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width || 0} height={shape.height || 0} fill={shape.fill || 'transparent'} cornerRadius={shape.cornerRadius || 0} />;  
if (shape.type === 'circle') return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.width || 0} fill={shape.fill || 'transparent'} />;
if (shape.type === 'text') return <Text key={shape.id} {...commonProps} x={shape.x} y={shape.y} text={shape.text} fontSize={shape.fontSize || 24} fontStyle={shape.fontStyle || 'normal'} textDecoration={shape.textDecoration || 'empty'} fill={shape.stroke} fontFamily={shape.fontFamily || 'sans-serif'} strokeEnabled={false} />;  
  if (shape.type === 'image') return <URLImage key={shape.id} shape={shape} commonProps={commonProps} />;
    return null;
  };

  if (!isMounted || !user) return <div className="w-full h-screen flex items-center justify-center text-black font-semibold">Loading Canvas...</div>;

  const activeUsers = [ { id: user.id, name: localUserName, color: localUserColor.current }, ...Object.entries(remoteCursors).map(([id, data]) => ({ id, name: data.name, color: data.color })) ];

  let canvasCursor = 'crosshair';
  if (isReadOnly) canvasCursor = 'default';
  else if (isSpacePressed) canvasCursor = 'grab';
  else if (activeTool === 'text') canvasCursor = 'text';
  else if (activeTool === 'select') canvasCursor = 'default';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50" style={{ cursor: canvasCursor }}>
      
      {/* Top Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-gray-200 shadow-sm ml-16">
          <input 
            type="text" value={boardName} onChange={(e) => setBoardName(e.target.value)} disabled={!isOwner} onBlur={() => { if (isOwner) lastSavedState.current = 'FORCE_SAVE'; }}
            className="text-black bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded-md px-3 py-1 text-sm font-bold outline-none transition-all w-48 lg:w-64 disabled:opacity-70"
          />
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex flex-row-reverse items-center">
            {activeUsers.map((u, idx) => (
              <div key={u.id} title={u.name} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm -ml-2" style={{ backgroundColor: u.color, zIndex: idx }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <button onClick={() => setIsAIOpen(!isAIOpen)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow-md transition-all">
            <Sparkles size={16} /> AI Co-Pilot
          </button>

          {!isReadOnly && (
            <label className={`flex items-center gap-2 bg-white border border-gray-200 text-sm text-black font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer ${isUploadingImage ? 'bg-gray-100 opacity-60 cursor-wait' : 'hover:bg-gray-50'}`}>
              <ImageIcon size={16} /> {isUploadingImage ? 'Uploading...' : 'Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
            </label>
          )}

          <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 bg-white text-black hover:bg-gray-50 border border-gray-200 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
            <Share size={16} /> Share
          </button>
          
          <button onClick={handleExportPNG} className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-black text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
            <Download size={16} /> PNG
          </button>

          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border border-black text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="absolute inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl border border-gray-200 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-black font-bold">Share Board</h2>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-black">&times;</button>
            </div>
            {isOwner ? (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">General Access</label>
                <select value={accessMode} onChange={(e) => handleAccessChange(e.target.value as 'RESTRICTED' | 'VIEW' | 'EDIT')} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer">
                  <option value="RESTRICTED">Restricted (Only you can access)</option>
                  <option value="VIEW">Anyone with the link can View</option>
                  <option value="EDIT">Anyone with the link can Edit</option>
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-6 border-l-4 border-blue-500 pl-3 bg-blue-50 py-2">You are a {isReadOnly ? 'Viewer' : 'Editor'} on this board. Only the owner can change access settings.</p>
            )}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="bg-transparent outline-none text-sm text-gray-600 w-full" />
              <button onClick={handleCopyLink} disabled={accessMode === 'RESTRICTED' && isOwner} className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap hover:bg-gray-800 disabled:opacity-50">{copySuccess ? 'Copied!' : 'Copy Link'}</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Side Panel */}
      {isAIOpen && (
        <div className="absolute top-20 right-4 w-80 md:w-96 bottom-4 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-[100] pointer-events-auto overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Sparkles size={18} className="text-purple-600" /> Gemini Architecture AI</h3>
            <button onClick={() => setIsAIOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-white text-sm flex flex-col gap-4">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="text-xs text-gray-400 mb-1 px-1 font-semibold">{msg.role === 'user' ? 'You' : 'Gemini'}</span>
                <div className={`p-3 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAILoading && (
              <div className="self-start flex flex-col items-start max-w-[85%]">
                <span className="text-xs text-gray-400 mb-1 px-1 font-semibold">Gemini</span>
                <div className="bg-gray-100 border border-gray-200 p-4 rounded-xl rounded-bl-sm flex gap-2 items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
            <input 
              type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleAIRequest(); }}
              disabled={isAILoading || isReadOnly} placeholder="e.g., Draw a user login flowchart..."
              className="flex-1 bg-white border border-gray-300 text-black rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button onClick={handleAIRequest} disabled={isAILoading || !aiPrompt.trim() || isReadOnly} className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Live Cursors */}
      {Object.entries(remoteCursors).map(([id, cursor]) => (
        <div key={id} style={{ position: 'absolute', top: (cursor.y * stageScale) + stagePos.y, left: (cursor.x * stageScale) + stagePos.x, zIndex: 9999, pointerEvents: 'none', transform: 'translate(-2px, -2px)' }} className="transition-all duration-75 ease-linear">
          <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L24 12L12 16L8 36L0 0Z" fill={cursor.color} stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <div className="px-2 py-1 rounded-md text-white text-xs font-bold mt-1 shadow-md whitespace-nowrap" style={{ backgroundColor: cursor.color, width: 'max-content' }}>{cursor.name}</div>
        </div>
      ))}

      {/* Text Input Overlay */}
      {textInput && !isReadOnly && (
        <textarea
          autoFocus value={textInput.value} onChange={handleTextChange}
          style={{
            position: 'absolute', top: (textInput.y * stageScale + stagePos.y) + 'px', left: (textInput.x * stageScale + stagePos.x) + 'px', color: strokeColor, fontSize: (fontSize * stageScale) + 'px', fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textDecoration: isUnderline ? 'underline' : 'none', background: 'transparent', border: '1px dashed #000', outline: 'none', padding: 0, margin: 0, resize: 'none', zIndex: 50, whiteSpace: 'pre', fontFamily: 'sans-serif',
          }}
          onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.width = e.currentTarget.scrollWidth + 'px'; }}
        />
      )}

      <Stage 
        ref={stageRef} width={dimensions.width} height={dimensions.height} 
        x={stagePos.x} y={stagePos.y} scaleX={stageScale} scaleY={stageScale}
        draggable={isSpacePressed} onWheel={handleWheel} 
        onDragEnd={(e) => { if (isReadOnly) return; if (e.target === stageRef.current) { setStagePos({ x: e.target.x(), y: e.target.y() }); } }}
        onDblClick={handleDblClick} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}
      >
        <Layer ref={layerRef}>
          {/* FIX: Massive White Background to prevent black JPEGs during export/thumbnail generation */}
          <Rect x={-50000} y={-50000} width={100000} height={100000} fill="#ffffff" listening={false} />

          {shapes.map((shape) => ( <Fragment key={shape.id}>{renderShape(shape)}</Fragment> ))}
         <Transformer 
            ref={trRef} 
            resizeEnabled={true} 
            rotateEnabled={false} 
            borderStroke="#0096FF" 
            borderStrokeWidth={2} 
            keepRatio={false} 
            boundBoxFunc={(oldBox, newBox) => {
              // FIREWALL: Prevent shape from collapsing into nothing during drag
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
          {selectionBox?.visible && ( <Rect x={Math.min(selectionBox.x1, selectionBox.x2)} y={Math.min(selectionBox.y1, selectionBox.y2)} width={Math.abs(selectionBox.x2 - selectionBox.x1)} height={Math.abs(selectionBox.y2 - selectionBox.y1)} fill="rgba(0, 161, 255, 0.2)" stroke="#00A1FF" strokeWidth={1} /> )}
        </Layer>
        <Layer>
          {Object.values(remoteShapes).map((shape) => ( <Fragment key={`remote-${shape.id}`}>{renderShape(shape, true)}</Fragment> ))}
          {activeShape && renderShape(activeShape)}
        </Layer>
      </Stage>
    </div>
  );
}
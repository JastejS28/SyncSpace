// import { create } from 'zustand';

// export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text';
// export type ToolType = 'select' | 'pen' | 'rectangle' | 'circle' | 'text';

// export interface CanvasShape {
//   id: string;
//   type: ShapeType;
//   x: number;
//   y: number;
//   width?: number;
//   height?: number;
//   fill?: string;
//   stroke?: string;
//   strokeWidth?: number;
//   points?: number[]; 
//   text?: string;     
//   fontSize?: number;
//   fontStyle?: 'normal' | 'bold' | 'italic' | 'italic bold'; 
//   textDecoration?: 'empty' | 'underline' | 'line-through';
// }

// interface BoardState {
//   shapes: CanvasShape[];
//   selectedShapeId: string | null;
//   history: CanvasShape[][];
//   historyStep: number;
  
//   activeTool: ToolType;
//   strokeColor: string;
//   strokeWidth: number;

//   addShape: (shape: CanvasShape) => void;
//   updateShape: (id: string, newAttributes: Partial<CanvasShape>) => void;
//   deleteShape: (id: string) => void;
//   setSelectedShape: (id: string | null) => void;
//   undo: () => void;
//   redo: () => void;
//   setInitialShapes: (shapes: CanvasShape[]) => void;
//   forceReplaceBoard: (shapes: CanvasShape[]) => void;

//   setActiveTool: (tool: ToolType) => void;
//   setStrokeColor: (color: string) => void;
//   setStrokeWidth: (width: number) => void;
// }

// export const useBoardStore = create<BoardState>((set, get) => ({
//   shapes: [],
//   selectedShapeId: null,
//   history: [[]], 
//   historyStep: 0,

//   activeTool: 'pen',
//   strokeColor: '#000000',
//   strokeWidth: 3,

//   setActiveTool: (tool) => set({ activeTool: tool, selectedShapeId: null }),
//   setStrokeColor: (color) => set({ strokeColor: color }),
//   setStrokeWidth: (width) => set({ strokeWidth: width }),

//   setInitialShapes: (shapes) => set({ shapes, history: [shapes], historyStep: 0 }),
//   setSelectedShape: (id) => set({ selectedShapeId: id }),

//   addShape: (shape) => {
//     const { shapes, history, historyStep } = get();
//     const newShapes = [...shapes, shape];
//     const newHistory = history.slice(0, historyStep + 1);
//     set({ shapes: newShapes, history: [...newHistory, newShapes], historyStep: historyStep + 1 });
//   },

//   updateShape: (id, newAttributes) => {
//     const { shapes, history, historyStep } = get();
//     const newShapes = shapes.map((shape) => shape.id === id ? { ...shape, ...newAttributes } : shape);
//     const newHistory = history.slice(0, historyStep + 1);
//     set({ shapes: newShapes, history: [...newHistory, newShapes], historyStep: historyStep + 1 });
//   },

//   deleteShape: (id) => {
//     const { shapes, history, historyStep, selectedShapeId } = get();
//     const newShapes = shapes.filter((shape) => shape.id !== id);
//     const newHistory = history.slice(0, historyStep + 1);
//     set({
//       shapes: newShapes,
//       history: [...newHistory, newShapes],
//       historyStep: historyStep + 1,
//       selectedShapeId: selectedShapeId === id ? null : selectedShapeId 
//     });
//   },

//   undo: () => {
//     const { historyStep, history } = get();
//     if (historyStep === 0) return; 
//     set({ historyStep: historyStep - 1, shapes: history[historyStep - 1], selectedShapeId: null });
//   },

//   redo: () => {
//     const { historyStep, history } = get();
//     if (historyStep === history.length - 1) return; 
//     set({ historyStep: historyStep + 1, shapes: history[historyStep + 1], selectedShapeId: null });
//   },

//   forceReplaceBoard: (newShapes) => {
//     const { history, historyStep } = get();
//     const newHistory = history.slice(0, historyStep + 1);
//     // CRITICAL FIX: We must push the forced sync into the history array, 
//     // otherwise the next time they hit undo, the app crashes.
//     set({ 
//       shapes: newShapes,
//       history: [...newHistory, newShapes],
//       historyStep: historyStep + 1
//     });
//   }
// }));




// // multiplt shapes being slected and dragged
// import { create } from 'zustand';

// export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text';
// export type ToolType = 'select' | 'pen' | 'rectangle' | 'circle' | 'text';

// export interface CanvasShape {
//   id: string;
//   type: ShapeType;
//   x: number;
//   y: number;
//   width?: number;
//   height?: number;
//   fill?: string;
//   stroke?: string;
//   strokeWidth?: number;
//   points?: number[]; 
//   text?: string;     
//   fontSize?: number;
//   fontStyle?: 'normal' | 'bold' | 'italic' | 'italic bold'; 
//   textDecoration?: 'empty' | 'underline' | 'line-through';
// }

// interface BoardState {
//   shapes: CanvasShape[];
//   // UPGRADED: Now an array to hold multiple selections
//   selectedShapeIds: string[];
//   history: CanvasShape[][];
//   historyStep: number;
  
//   activeTool: ToolType;
//   strokeColor: string;
//   strokeWidth: number;

//   addShape: (shape: CanvasShape) => void;
//   updateShape: (id: string, newAttributes: Partial<CanvasShape>) => void;
//   deleteShape: (id: string) => void;
//   // UPGRADED
//   setSelectedShapeIds: (ids: string[]) => void;
//   undo: () => void;
//   redo: () => void;
//   setInitialShapes: (shapes: CanvasShape[]) => void;
//   forceReplaceBoard: (shapes: CanvasShape[]) => void;

//   setActiveTool: (tool: ToolType) => void;
//   setStrokeColor: (color: string) => void;
//   setStrokeWidth: (width: number) => void;
// }

// export const useBoardStore = create<BoardState>((set, get) => ({
//   shapes: [],
//   selectedShapeIds: [],
//   history: [[]], 
//   historyStep: 0,

//   activeTool: 'pen',
//   strokeColor: '#000000',
//   strokeWidth: 3,

//   // Deselect everything when changing tools
//   setActiveTool: (tool) => set({ activeTool: tool, selectedShapeIds: [] }),
//   setStrokeColor: (color) => set({ strokeColor: color }),
//   setStrokeWidth: (width) => set({ strokeWidth: width }),

//   setInitialShapes: (shapes) => set({ shapes, history: [shapes], historyStep: 0 }),
//   setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),

//   addShape: (shape) => {
//     const { shapes, history, historyStep } = get();
//     const newShapes = [...shapes, shape];
//     const newHistory = history.slice(0, historyStep + 1);
//     set({ shapes: newShapes, history: [...newHistory, newShapes], historyStep: historyStep + 1 });
//   },

//   updateShape: (id, newAttributes) => {
//     const { shapes, history, historyStep } = get();
//     const newShapes = shapes.map((shape) => shape.id === id ? { ...shape, ...newAttributes } : shape);
//     const newHistory = history.slice(0, historyStep + 1);
//     set({ shapes: newShapes, history: [...newHistory, newShapes], historyStep: historyStep + 1 });
//   },

//   deleteShape: (id) => {
//     const { shapes, history, historyStep, selectedShapeIds } = get();
//     const newShapes = shapes.filter((shape) => shape.id !== id);
//     const newHistory = history.slice(0, historyStep + 1);
//     set({
//       shapes: newShapes,
//       history: [...newHistory, newShapes],
//       historyStep: historyStep + 1,
//       selectedShapeIds: selectedShapeIds.filter(selectedId => selectedId !== id) 
//     });
//   },

//   undo: () => {
//     const { historyStep, history } = get();
//     if (historyStep === 0) return; 
//     set({ historyStep: historyStep - 1, shapes: history[historyStep - 1], selectedShapeIds: [] });
//   },

//   redo: () => {
//     const { historyStep, history } = get();
//     if (historyStep === history.length - 1) return; 
//     set({ historyStep: historyStep + 1, shapes: history[historyStep + 1], selectedShapeIds: [] });
//   },

//   forceReplaceBoard: (newShapes) => {
//     const { history, historyStep } = get();
//     const newHistory = history.slice(0, historyStep + 1);
//     set({ 
//       shapes: newShapes,
//       history: [...newHistory, newShapes],
//       historyStep: historyStep + 1,
//       selectedShapeIds: [] // Force clear selection on network sync
//     });
//   }
// }));




//text
import { create } from 'zustand';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text' | 'image';
export type ToolType = 'select' | 'pen' | 'rectangle' | 'circle' | 'text';

export interface CanvasShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  points?: number[]; 
  text?: string;     
  fontSize?: number;
  cornerRadius?: number;
  fontFamily?: string;

  url?: string; // <-- ADD THIS LINE
  fontStyle?: 'normal' | 'bold' | 'italic' | 'italic bold'; 
  textDecoration?: 'empty' | 'underline' | 'line-through';
}

interface BoardState {
  shapes: CanvasShape[];
  selectedShapeIds: string[];
  history: CanvasShape[][];
  historyStep: number;
  isReadOnly: boolean;
  
  activeTool: ToolType;
  strokeColor: string;
  strokeWidth: number;
  

  // --- NEW: Text Formatting States ---
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;

  addShape: (shape: CanvasShape) => void;
  clearBoard: () => void; // <-- ADD THIS
  deleteShapes: (ids: string[]) => void;
  updateShape: (id: string, newAttributes: Partial<CanvasShape>) => void;
  deleteShape: (id: string) => void;
    setIsReadOnly: (readOnly: boolean) => void;

  setSelectedShapeIds: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
  setInitialShapes: (shapes: CanvasShape[]) => void;
  forceReplaceBoard: (shapes: CanvasShape[]) => void;

  setActiveTool: (tool: ToolType) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  
  // --- NEW: Text Formatting Actions ---
  setFontSize: (size: number) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  shapes: [],
  selectedShapeIds: [],
  history: [[]], 
  historyStep: 0,

  activeTool: 'pen',
  strokeColor: '#000000',
  strokeWidth: 3,

  // Default Text States
  fontSize: 24,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isReadOnly: false,
  setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  deleteShapes: (ids) => set((state) => ({ 
  shapes: state.shapes.filter(shape => !ids.includes(shape.id)) 
})),

  setActiveTool: (tool) => set({ activeTool: tool, selectedShapeIds: [] }),
  clearBoard: () => set({ shapes: [], history: [[]], historyStep: 0 }), // <-- ADD THIS
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  // Formatting Action Implementations
  setFontSize: (size) => set({ fontSize: size }),
  toggleBold: () => set((state) => ({ isBold: !state.isBold })),
  toggleItalic: () => set((state) => ({ isItalic: !state.isItalic })),
  toggleUnderline: () => set((state) => ({ isUnderline: !state.isUnderline })),

  setInitialShapes: (shapes) => set({ shapes, history: [shapes], historyStep: 0 }),
  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),

  addShape: (shape) => {
    const { shapes, history, historyStep } = get();
    const newShapes = [...shapes, shape];
    const newHistory = history.slice(0, historyStep + 1);
    set({ shapes: newShapes, history: [...newHistory, newShapes], historyStep: historyStep + 1 });
  },

  updateShape: (id, newAttributes) => {
    const { shapes, history, historyStep } = get();
    const newShapes = shapes.map((shape) => shape.id === id ? { ...shape, ...newAttributes } : shape);
    const newHistory = history.slice(0, historyStep + 1);
    set({ shapes: newShapes, history: [...newHistory, newShapes], historyStep: historyStep + 1 });
  },

  deleteShape: (id) => {
    const { shapes, history, historyStep, selectedShapeIds } = get();
    const newShapes = shapes.filter((shape) => shape.id !== id);
    const newHistory = history.slice(0, historyStep + 1);
    set({
      shapes: newShapes,
      history: [...newHistory, newShapes],
      historyStep: historyStep + 1,
      selectedShapeIds: selectedShapeIds.filter(selectedId => selectedId !== id) 
    });
  },

  undo: () => {
    const { historyStep, history } = get();
    if (historyStep === 0) return; 
    set({ historyStep: historyStep - 1, shapes: history[historyStep - 1], selectedShapeIds: [] });
  },

  redo: () => {
    const { historyStep, history } = get();
    if (historyStep === history.length - 1) return; 
    set({ historyStep: historyStep + 1, shapes: history[historyStep + 1], selectedShapeIds: [] });
  },

  forceReplaceBoard: (newShapes) => {
    const { history, historyStep } = get();
    const newHistory = history.slice(0, historyStep + 1);
    set({ 
      shapes: newShapes,
      history: [...newHistory, newShapes],
      historyStep: historyStep + 1,
      selectedShapeIds: []
    });
  }
}));
import { useState } from 'react';
import { useUser } from '@stackframe/stack';
import { v4 as uuidv4 } from 'uuid';
import dagre from 'dagre';
import { socketService } from '@/services/socketService';
import type { CanvasShape } from '@/store/boardStore';
import type { ChatMessage } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

type UseAICopilotArgs = {
  roomId: string;
  user: { id: string } | null | undefined;
  isReadOnly: boolean;
  stageRef: React.MutableRefObject<any>;
  stagePos: { x: number; y: number };
  stageScale: number;
  addShape: (shape: CanvasShape) => void;
};

export function useAICopilot({ roomId, user, isReadOnly, stageRef, stagePos, stageScale, addShape }: UseAICopilotArgs) {
  const stackUser = useUser({ or: 'redirect' });
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Hello! I am your AI architect. Ask me to draw a flowchart, or summarize what is currently on the board.' },
  ]);
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIRequest = async () => {
    if (!aiPrompt.trim() || isAILoading || isReadOnly) return;

    const userMessage = aiPrompt;
    setChatHistory((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsAILoading(true);
    setAiPrompt('');

    try {
      const imageBase64 = stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg', quality: 0.5 }) : null;

      const token = await stackUser.getAccessToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/ai/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ prompt: userMessage, imageBase64 }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'AI Generation Failed');

      const aiData = result.data;
      setChatHistory((prev) => [...prev, { role: 'ai', text: aiData.message || 'Generated successfully.' }]);

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
        const spawnX = window.innerWidth / 2 - offsetX - 200;
        const spawnY = window.innerHeight / 3 - offsetY;

        g.nodes().forEach((v) => {
          const node = g.node(v);
          if (!node) return;

          const trueX = node.x - node.width / 2 + spawnX;
          const trueY = node.y - node.height / 2 + spawnY;

          generatedShapes.push({
            id: uuidv4(),
            type: 'rectangle',
            x: trueX,
            y: trueY,
            width: node.width,
            height: node.height,
            stroke: '#3b82f6',
            strokeWidth: 2,
            fill: '#1e293b',
            cornerRadius: 8,
          });

          generatedShapes.push({
            id: uuidv4(),
            type: 'text',
            x: trueX + 20,
            y: trueY + 22,
            text: node.label,
            fontSize: 14,
            stroke: '#f8fafc',
            fontFamily: 'monospace',
          });
        });

        g.edges().forEach((e) => {
          const edge = g.edge(e);
          if (!edge) return;

          const points: number[] = [];
          edge.points.forEach((p: { x: number; y: number }) => {
            points.push(p.x + spawnX);
            points.push(p.y + spawnY);
          });

          generatedShapes.push({
            id: uuidv4(),
            type: 'line',
            x: 0,
            y: 0,
            points,
            stroke: '#64748b',
            strokeWidth: 2,
          });
        });

        generatedShapes.forEach((shape) => {
          addShape(shape);
          if (socketService.socket && user) {
            socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape });
          }
        });
      } else if (aiData.shapes && Array.isArray(aiData.shapes)) {
        aiData.shapes.forEach((shape: CanvasShape) => {
          const safeId = uuidv4();

          const adjustedShape = {
            ...shape,
            id: safeId,
            x: (shape.x - stagePos.x) / stageScale,
            y: (shape.y - stagePos.y) / stageScale,
          } as CanvasShape;

          if (adjustedShape.type === 'line' && adjustedShape.points) {
            adjustedShape.points = [
              (adjustedShape.points[0] - stagePos.x) / stageScale,
              (adjustedShape.points[1] - stagePos.y) / stageScale,
              (adjustedShape.points[2] - stagePos.x) / stageScale,
              (adjustedShape.points[3] - stagePos.y) / stageScale,
            ];
          }

          addShape(adjustedShape);
          if (socketService.socket && user) {
            socketService.socket.emit('draw-event', { roomId, userId: user.id, action: 'add', shape: adjustedShape });
          }
        });
      }
    } catch (error) {
      console.error('🔴 AI Error:', error);
      setChatHistory((prev) => [...prev, { role: 'ai', text: 'Network failure. Could not reach Gemini AI.' }]);
    } finally {
      setIsAILoading(false);
    }
  };

  return {
    isAIOpen,
    setIsAIOpen,
    aiPrompt,
    setAiPrompt,
    chatHistory,
    isAILoading,
    handleAIRequest,
  };
}

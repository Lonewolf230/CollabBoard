import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

type Props = {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
  initialCanvasState?: string;
};

export default function FabricCanvas({ canvasRef, initialCanvasState }: Props) {
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);

  useEffect(() => {
    if (!htmlCanvasRef.current) return;

    console.log("Initializing new canvas");
    const canvas = new fabric.Canvas(htmlCanvasRef.current, {
      backgroundColor: "white",
      width: window.innerWidth + 100,
      height: window.innerHeight + 100,
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 3;
    canvas.isDrawingMode = true;
    
    canvasRef.current = canvas;
    setIsCanvasLoaded(true);

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 80,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);  

  useEffect(() => {
    if (!isCanvasLoaded || !canvasRef.current || !initialCanvasState) return;
    
    console.log("Loading initial canvas state:", typeof initialCanvasState);
    
    try {
      const canvasState = typeof initialCanvasState === 'string' 
        ? JSON.parse(initialCanvasState) 
        : initialCanvasState;
      
      canvasRef.current.loadFromJSON(canvasState, () => {
        console.log("Canvas state loaded successfully");
        canvasRef.current?.renderAll();
        
        setTimeout(() => {
          canvasRef.current?.renderAll();
        }, 50);
        setTimeout(() => {
          canvasRef.current?.renderAll();
        }, 200);
      });
    } catch (error) {
      console.error("Error loading canvas state:", error);
      console.error("State content:", initialCanvasState);
    }
  }, [isCanvasLoaded, initialCanvasState]);

  return (
    <div style={{overflow: "scroll"}}>
      <canvas ref={htmlCanvasRef}></canvas>
    </div>
  );
}
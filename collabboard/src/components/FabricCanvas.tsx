import { useEffect, useRef } from "react";
import * as fabric from "fabric";

type Props = {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
};

export default function FabricCanvas({ canvasRef }: Props) {
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!htmlCanvasRef.current) return;

    const canvas = new fabric.Canvas(htmlCanvasRef.current, {
      backgroundColor: "white",
      width: window.innerWidth,
      height: window.innerHeight - 80,
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 3;
    canvas.isDrawingMode = true;

    canvas.renderAll();
    canvasRef.current = canvas;

    // Handle window resize
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
  }, [canvasRef]);

  return <canvas ref={htmlCanvasRef} />;
}
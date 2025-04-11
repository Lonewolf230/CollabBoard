import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import Sidebar from "../components/Sidebar";
import ToolBar from "../components/ToolBar";
import FabricCanvas from "../components/FabricCanvas";
import { FabricContext } from "../context/FabricContext";
import "./WhiteBoard.css";

export default function WhiteBoard() {
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  // This effect runs when the canvas is initialized in FabricCanvas
  useEffect(() => {
    if (fabricCanvasRef.current && !canvas) {
      setCanvas(fabricCanvasRef.current);
    }
  }, [canvas, fabricCanvasRef.current]);

  return (
    <FabricContext.Provider value={canvas}>
      <div className="whiteboard-container">
        <Sidebar />
        <main className="whiteboard-content">
          <FabricCanvas canvasRef={fabricCanvasRef} />
        </main>
        <ToolBar />
      </div>
    </FabricContext.Provider>
  );
}
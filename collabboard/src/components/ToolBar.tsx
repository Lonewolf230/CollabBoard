import { Pencil, Eraser, Pen, Brush, Highlighter, Type } from "lucide-react";
import { useFabric } from "../context/FabricContext";
import "./ToolBar.css";
import * as fabric from 'fabric';
import { useState } from "react";

export default function ToolBar() {
  const canvas = useFabric();
  const [activeTool, setActiveTool] = useState("pen");

  const handleTool = (tool: string) => {
    if (!canvas) return;
  
    canvas.off("mouse:down"); // clear previous mouse listeners
    setActiveTool(tool);
  
    switch (tool) {
      case "pencil":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = "#000";
        canvas.freeDrawingBrush.width = 1;
        break;
        
      case "pen":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = "#000";
        canvas.freeDrawingBrush.width = 2;
        break;
  
      case "brush":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = "#000";
        canvas.freeDrawingBrush.width = 5;
        break;
  
      case "highlighter":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = "rgba(255,255,0,0.4)";
        canvas.freeDrawingBrush.width = 15;
        break;
  
      case "eraser":
        canvas.isDrawingMode = false;
        canvas.on("mouse:down", (opt) => {
          const target = canvas.findTarget(opt.e);
          if (target) {
            canvas.remove(target);
            canvas.renderAll();
          }
        });
        break;
  
      case "text":
        canvas.isDrawingMode = false;
        canvas.on("mouse:down", (opt) => {
          // Only add text if we're not clicking on an existing object
          if (!canvas.findTarget(opt.e)) {
            const pointer = canvas.getPointer(opt.e);
            const textbox = new fabric.IText("Type here", {
              left: pointer.x,
              top: pointer.y,
              fontSize: 24,
              fill: "black",
              editable: true,
              borderColor: "gray",
              cornerColor: "blue",
              cornerSize: 6,
              transparentCorners: false,
            });
            canvas.add(textbox);
            canvas.setActiveObject(textbox);
            textbox.enterEditing();
            canvas.off("mouse:down"); // Remove listener after adding text
          }
        });
        break;
  
      default:
        break;
    }
  
    canvas.renderAll();
  };
  

  return (
    <div className="tool-bar">
      <div 
        className={`tool ${activeTool === "pen" ? "active" : ""}`}
        onClick={() => handleTool("pen")}
      >
        <Pen />
      </div>
      <div 
        className={`tool ${activeTool === "pencil" ? "active" : ""}`}
        onClick={() => handleTool("pencil")}
      >
        <Pencil />
      </div>
      <div 
        className={`tool ${activeTool === "highlighter" ? "active" : ""}`}
        onClick={() => handleTool("highlighter")}
      >
        <Highlighter />
      </div>
      <div 
        className={`tool ${activeTool === "eraser" ? "active" : ""}`}
        onClick={() => handleTool("eraser")}
      >
        <Eraser />
      </div>
      <div 
        className={`tool ${activeTool === "brush" ? "active" : ""}`}
        onClick={() => handleTool("brush")}
      >
        <Brush />
      </div>
      <div 
        className={`tool ${activeTool === "text" ? "active" : ""}`}
        onClick={() => handleTool("text")}
      >
        <Type />
      </div>
    </div>
  );
}
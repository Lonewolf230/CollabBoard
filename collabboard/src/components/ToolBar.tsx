import { Pencil, Eraser, Pen, Brush, Highlighter, Type, Radius, Circle, Shapes, Square, Triangle, Hexagon } from "lucide-react";
import { useFabric } from "../context/FabricContext";
import "./ToolBar.css";
import * as fabric from 'fabric';
import { useState, useRef, useEffect } from "react";

export default function ToolBar() {
  const canvas = useFabric();
  const [activeTool, setActiveTool] = useState("pen");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const [showShapesList, setShowShapesList] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(5);
  
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const radiusSliderRef = useRef<HTMLDivElement>(null);
  const shapesListRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the popup elements to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (radiusSliderRef.current && !radiusSliderRef.current.contains(event.target as Node)) {
        setShowRadiusSlider(false);
      }
      if (shapesListRef.current && !shapesListRef.current.contains(event.target as Node)) {
        setShowShapesList(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // This effect runs when the selected color or brush radius changes
  // to ensure the current tool uses the updated values
  useEffect(() => {
    if (canvas && activeTool) {
      handleTool(activeTool);
    }
  }, [selectedColor, brushRadius]);

  const handleTool = (tool: string) => {
    if (!canvas) return;
  
    canvas.off("mouse:down"); 
    setActiveTool(tool);
  
    switch (tool) {
      case "pencil":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = selectedColor;
        canvas.freeDrawingBrush.width = 1;
        break;
        
      case "pen":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = selectedColor;
        canvas.freeDrawingBrush.width = 2;
        break;
  
      case "brush":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = selectedColor;
        canvas.freeDrawingBrush.width = brushRadius;
        break;
  
      case "highlighter":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = `${selectedColor}66`; // Add transparency
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
            const textbox = new fabric.IText("", {
              left: pointer.x,
              top: pointer.y,
              fontSize: 24,
              fill: selectedColor,
              editable: true,
              borderColor: "gray",
              cornerColor: "blue",
              cornerSize: 6,
              transparentCorners: false,
            });
            canvas.add(textbox);
            canvas.setActiveObject(textbox);
            textbox.enterEditing();
            canvas.off("mouse:down");
          }
        });
        break;
        
      case "circle":
        canvas.isDrawingMode = false;
        canvas.on("mouse:down", (opt) => {
          if (!canvas.findTarget(opt.e)) {
            const pointer = canvas.getPointer(opt.e);
            const circle = new fabric.Circle({
              left: pointer.x,
              top: pointer.y,
              radius: brushRadius,
              fill: selectedColor,
              stroke: "black",
              strokeWidth: 1,
            });
            canvas.add(circle);
            canvas.setActiveObject(circle);
          }
        });
        break;
        
      case "square":
        canvas.isDrawingMode = false;
        canvas.on("mouse:down", (opt) => {
          if (!canvas.findTarget(opt.e)) {
            const pointer = canvas.getPointer(opt.e);
            const square = new fabric.Rect({
              left: pointer.x,
              top: pointer.y,
              width: brushRadius * 2,
              height: brushRadius * 2,
              fill: selectedColor,
              stroke: "black",
              strokeWidth: 1,
            });
            canvas.add(square);
            canvas.setActiveObject(square);
          }
        });
        break;
        
      case "triangle":
        canvas.isDrawingMode = false;
        canvas.on("mouse:down", (opt) => {
          if (!canvas.findTarget(opt.e)) {
            const pointer = canvas.getPointer(opt.e);
            const triangle = new fabric.Triangle({
              left: pointer.x,
              top: pointer.y,
              width: brushRadius * 2,
              height: brushRadius * 2,
              fill: selectedColor,
              stroke: "black",
              strokeWidth: 1,
            });
            canvas.add(triangle);
            canvas.setActiveObject(triangle);
          }
        });
        break;
        
      case "hexagon":
        canvas.isDrawingMode = false;
        canvas.on("mouse:down", (opt) => {
          if (!canvas.findTarget(opt.e)) {
            const pointer = canvas.getPointer(opt.e);
            const points = [];
            const sides = 6;
            const radius = brushRadius;
            
            for (let i = 0; i < sides; i++) {
              const angle = (Math.PI * 2 * i) / sides;
              points.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
              });
            }
            
            const hexagon = new fabric.Polygon(points, {
              left: pointer.x,
              top: pointer.y,
              fill: selectedColor,
              stroke: "black",
              strokeWidth: 1
            });
            
            canvas.add(hexagon);
            canvas.setActiveObject(hexagon);
          }
        });
        break;
  
      default:
        break;
    }
  
    canvas.renderAll();
  };
  
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Update the current brush color if canvas is in drawing mode
    if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      if (activeTool === "highlighter") {
        canvas.freeDrawingBrush.color = `${color}66`; // Add transparency
      }
    }
  };
  
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBrushRadius(value);
    
    // Update the current brush width if canvas is in drawing mode
    if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = value;
    }
  };

  const commonColors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", 
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", 
    "#800080", "#008000", "#800000", "#808080"
  ];
  
  const shapes = [
    { name: "square", icon: Square },
    { name: "circle", icon: Circle },
    { name: "triangle", icon: Triangle },
    { name: "hexagon", icon: Hexagon }
  ];

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
      
      {/* Circle with Color Picker */}
      <div className="tool-container" ref={colorPickerRef}>
        <div 
          className={`tool ${activeTool === "circle" ? "active" : ""}`}
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowRadiusSlider(false);
            setShowShapesList(false);
            
          }}
          style={{ position: "relative" }}
        >
          <Circle />
          <div 
            className="color-indicator" 
            style={{ 
              backgroundColor: selectedColor,
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              position: "absolute",
              bottom: "2px",
              right: "2px",
              border: "1px solid white"
            }} 
          />
        </div>
        
        {showColorPicker && (
          <div className="color-picker-popup">
            <div className="color-grid">
              {commonColors.map((color, index) => (
                <div 
                  key={index}
                  className="color-option"
                  style={{ 
                    backgroundColor: color,
                    width: "20px",
                    height: "20px",
                    margin: "2px",
                    border: selectedColor === color ? "2px solid white" : "1px solid #ccc",
                    cursor: "pointer"
                  }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
            <input 
              type="color" 
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>
        )}
      </div>
      
      {/* Radius Slider */}
      <div className="tool-container" ref={radiusSliderRef}>
        <div 
          className="tool"
          onClick={() => {
            setShowRadiusSlider(!showRadiusSlider);
            setShowColorPicker(false);
            setShowShapesList(false);
          }}
        >
          <Radius />
        </div>
        
        {showRadiusSlider && (
          <div className="radius-slider-popup">
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={brushRadius}
              onChange={handleRadiusChange}
              style={{ width: "100%" }}
            />
            <div className="radius-preview" style={{ 
              width: `${brushRadius * 2}px`, 
              height: `${brushRadius * 2}px`,
              borderRadius: "50%",
              backgroundColor: selectedColor,
              margin: "8px auto"
            }} />
            <div className="radius-value">{brushRadius}px</div>
          </div>
        )}
      </div>
      
      {/* Shapes List */}
      <div className="tool-container" ref={shapesListRef}>
        <div 
          className="tool"
          onClick={() => {
            setShowShapesList(!showShapesList);
            setShowColorPicker(false);
            setShowRadiusSlider(false);
          }}
        >
          <Shapes />
        </div>
        
        {showShapesList && (
          <div className="shapes-list-popup">
            {shapes.map((shape, index) => {
              const ShapeIcon = shape.icon;
              return (
                <div 
                  key={index}
                  className={`shape-option ${activeTool === shape.name ? "active" : ""}`}
                  onClick={() => {
                    handleTool(shape.name);
                    setShowShapesList(false);
                  }}
                  style={{ 
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <ShapeIcon size={20} />
                  <span>{shape.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
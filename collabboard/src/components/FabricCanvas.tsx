

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useAuth } from "../providers/AuthProvider";
import { io, Socket } from "socket.io-client";

type Props = {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
  initialCanvasState?: string;
  hasEditAccess?: boolean;
  boardId: string;
};

export default function FabricCanvas({ canvasRef, initialCanvasState, hasEditAccess, boardId }: Props) {
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const { user } = useAuth();
  const isUpdatingRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const lastSyncedStateRef = useRef<string | null>(null);
  const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectModificationInProgress = useRef(false);

  
  useEffect(() => {
    if (!htmlCanvasRef.current) return;

    console.log("Initializing new canvas");
    const canvas = new fabric.Canvas(htmlCanvasRef.current, {
      backgroundColor: "white",
      width: window.innerWidth - 50,
      height: window.innerHeight - 100,
      selection: hasEditAccess,
      preserveObjectStacking: true,
    });

    if (hasEditAccess) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "black";
      canvas.freeDrawingBrush.width = 3;
      canvas.isDrawingMode = true;
    } else {
      canvas.selection = false;
      canvas.hoverCursor = 'default';
      canvas.defaultCursor = 'default';
      canvas.isDrawingMode = false;
    }
    
    canvasRef.current = canvas;
    setIsCanvasLoaded(true);

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 50,
        height: window.innerHeight - 100,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    
    // Force render when canvas is created
    setTimeout(() => {
      canvas.renderAll();
    }, 100);

    // Set up periodic render to ensure canvas is visible
    const periodicRender = setInterval(() => {
      if (canvas) {
        canvas.renderAll();
      }
    }, 1000);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
      clearInterval(periodicRender);
    };
  }, []);

  // Load initial state from props
  useEffect(() => {
    if (!isCanvasLoaded || !canvasRef.current || isUpdatingRef.current) return;
    
    if (initialCanvasState && initialCanvasState !== "") {
      // console.log("Loading initial canvas state");
      
      try {
        isUpdatingRef.current = true;
        
        const canvasState = typeof initialCanvasState === 'string' 
          ? JSON.parse(initialCanvasState) 
          : initialCanvasState;

        lastSyncedStateRef.current = typeof initialCanvasState === 'string'
          ? initialCanvasState : JSON.stringify(initialCanvasState);
        
        // prevent stacking issues
        canvasRef.current.clear();
        
        canvasRef.current.loadFromJSON(canvasState, () => {
          console.log("Canvas state loaded successfully");
          
          // multiple renders to ensure everything is visible
          for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
              if (canvasRef.current) {
                canvasRef.current.renderAll();
              }
            }, i * 200);
          }
          
          if (!hasEditAccess && canvasRef.current) {
            canvasRef.current.getObjects().forEach(obj => {
              obj.selectable = false;
              obj.evented = false;
            });
            canvasRef.current.selection = false;
            canvasRef.current.renderAll();
          }
          
          isUpdatingRef.current = false;
        });
      } catch (error) {
        // console.error("Error loading initial canvas state:", error);
        isUpdatingRef.current = false;
      }
    } else {
      // console.log("No initial canvas state");
    }
  }, [isCanvasLoaded, initialCanvasState, hasEditAccess]);

  useEffect(() => {
    if (!isCanvasLoaded || !canvasRef.current || !boardId || !user?.email) return;
    
    const canvas = canvasRef.current;
    
    if (!socketRef.current) {
      // console.log("Connecting to WebSocket server");
      socketRef.current = io(import.meta.env.VITE_BACKEND_URL);
      
      socketRef.current.on('connect', () => {
        // console.log("WebSocket connected, joining room:", boardId);
        socketRef.current?.emit('join-room', {
          roomId: boardId,
          userId: user.email
        });
      });
    }
    
    const handleCanvasUpdate = (data: any) => {
      if (!canvasRef.current || isUpdatingRef.current) return;
      
      if (data.userId === user.email) {
        // console.log("Ignoring update from self");
        return;
      }
      
      if (lastSyncedStateRef.current === data.state) {
        // console.log("Ignoring duplicate state update");
        return;
      }
      
      // console.log(`Received canvas update from: ${data.userId}`);
      
      try {
        isUpdatingRef.current = true;
        lastSyncedStateRef.current = data.state;
        
        const canvasState = JSON.parse(data?data.state:'');
        canvas.clear();
        
        canvas.loadFromJSON(canvasState, () => {
          canvas.renderAll();
          // console.log("Successfully rendered updated canvas from WebSocket");
          
          if (!hasEditAccess) {
            canvas.getObjects().forEach(obj => {
              obj.selectable = false;
              obj.evented = false;
            });
            canvas.selection = false;
          }
          isUpdatingRef.current = false;
        });
      } catch (error) {
        // console.error("Error processing canvas update:", error);
        isUpdatingRef.current = false;
      }
    };

    const handleCanvasStateRequest=()=>{
      if(!canvasRef.current || !hasEditAccess) return;
      // console.log("Canvas state requested by server, syncing...");
      try {
        ensureObjectIds();
        const canvasState = JSON.stringify(canvasRef.current.toJSON());
        socketRef.current?.emit('canvas-update', {
          roomId: boardId,
          userId: user.email,
          state: canvasState,
          timestamp: Date.now()
        })
        // console.log(`Sent data to new user: ${data.requestingUserId}`);
        
      } catch (error) {
        // console.error("Error syncing canvas state:", error);
      }  
    }
    
    socketRef.current.on('canvas-update', handleCanvasUpdate);
    const ensureObjectIds = () => {
      if (!canvas) return;
      
      canvas.getObjects().forEach((obj: any, index) => {
        if (!obj.customId) {
          obj.customId = `${Date.now()}-${index}`;
        }
      });
    };    
    const syncToClients = () => {
      if (isUpdatingRef.current || !canvasRef.current || objectModificationInProgress.current) return;
      
      try {
        ensureObjectIds();
        const canvasState = JSON.stringify(canvas.toJSON());
        if (lastSyncedStateRef.current === canvasState) {
          // console.log("No changes to sync");
          return;
        }
        
        // console.log("Syncing canvas to WebSocket clients...");
        lastSyncedStateRef.current = canvasState;
        
        socketRef.current?.emit('canvas-update', {
          roomId: boardId,
          userId: user.email,
          state: canvasState,
          timestamp: Date.now()
        });
      } catch (error) {
        // console.error("Error syncing canvas:", error);
      }
    };
    
    if (hasEditAccess) {
      // console.log("Attaching canvas change listeners for edit mode");
      
      const handlePathCreated = () => {
        // console.log("Path created, syncing...");
        if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
        throttleTimeout.current = setTimeout(syncToClients, 300);
      };
      
      const handleModificationStart = () => {
        objectModificationInProgress.current = true;
      };
      
      const handleModificationComplete = () => {
        objectModificationInProgress.current = false;
        // console.log("Object modification complete, syncing...");
        if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
        throttleTimeout.current = setTimeout(syncToClients, 300);
      };
      
      const handleObjectAdded = (e: any) => {
        // Skip for path objects which are handled by path:created
        if (e.target && e.target.type === 'path') return;
        
        // console.log("Object added, syncing...");
        if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
        throttleTimeout.current = setTimeout(syncToClients, 300);
      };
      
      const handleObjectRemoved = () => {
        // console.log("Object removed, syncing...");
        if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
        throttleTimeout.current = setTimeout(syncToClients, 300);
      };
      
      canvas.on('path:created', handlePathCreated);
      canvas.on('object:modified', handleModificationComplete);
      canvas.on('object:added', handleObjectAdded);
      canvas.on('object:removed', handleObjectRemoved);
      canvas.on('mouse:down', handleModificationStart);
      canvas.on('mouse:up', handleModificationComplete);
      
      const periodicSyncInterval = setInterval(() => {
        if (!objectModificationInProgress.current) {
          syncToClients();
        }
      }, 2000);
      
      return () => {
        socketRef.current?.off('canvas-update', handleCanvasUpdate);
        socketRef.current?.off('request-canvas-state',handleCanvasStateRequest)
        canvas.off('path:created', handlePathCreated);
        canvas.off('object:modified', handleModificationComplete);
        canvas.off('object:added', handleObjectAdded);
        canvas.off('object:removed', handleObjectRemoved);
        canvas.off('mouse:down', handleModificationStart);
        canvas.off('mouse:up', handleModificationComplete);
        
        clearInterval(periodicSyncInterval);
        
        if (throttleTimeout.current) {
          clearTimeout(throttleTimeout.current);
        }
      };
    } else {
      return () => {
        socketRef.current?.off('canvas-update', handleCanvasUpdate);
      };
    }
  }, [isCanvasLoaded, boardId, hasEditAccess, user?.email]);

  const handleCanvasClick = () => {
    if (canvasRef.current) {
      canvasRef.current.renderAll();
    }
  };

  return (
    <div 
      style={{ overflow: "auto", width: "100%", height: "100%" }}
      onClick={handleCanvasClick}
    >
      <canvas ref={htmlCanvasRef}></canvas>
    </div>
  );
}
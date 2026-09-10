
import { Rect, Circle, IText,PencilBrush } from 'fabric';

// Initializes and returns a standard configuration object for shape controls

const getControlConfig = () => ({
  cornerColor: '#2c3e50',
  cornerSize: 8,
  transparentCorners: false,
  borderColor: '#3498db',
  borderScaleFactor: 2
});

//  Adds a rectangle to the active Fabric canvas

export const addRectangle = (canvasRef, color) => {
  if (!canvasRef.current) return;

  const rect = new Rect({
    left: 150,
    top: 150,
    fill: color,
    width: 100,
    height: 60,
    ...getControlConfig()
  });

  canvasRef.current.add(rect);
  canvasRef.current.setActiveObject(rect);
  canvasRef.current.renderAll();
};

//  Adds a circle to the active Fabric canvas

export const addCircle = (canvasRef, color) => {
  if (!canvasRef.current) return;

  const circle = new Circle({
    left: 200,
    top: 200,
    fill: color,
    radius: 40,
    ...getControlConfig()
  });

  canvasRef.current.add(circle);
  canvasRef.current.setActiveObject(circle);
  canvasRef.current.renderAll();
};

//  Adds an editable text box to the active Fabric canvas

export const addText = (canvasRef, color) => {
  if (!canvasRef.current) return;

  // We explicitly declare standard initial dimension placeholders 
  // so Fabric v6 serialization doesn't calculate an 'undefined' crash footprint
  const text = new IText("Double Click to Edit", {
    left: 100,
    top: 100,
    fontSize: 24,
    fill: color,
    styles: {}, // Prevents Fabric v6 nested parsing array crash
    ...getControlConfig()
  });

  canvasRef.current.add(text);
  canvasRef.current.setActiveObject(text);
  canvasRef.current.renderAll();
};


//  Toggles the brush drawing mode on and off

export const togglePenMode = (canvasRef, color) => {
  if (!canvasRef.current) return false;
  const canvas = canvasRef.current;

  canvas.isDrawingMode = !canvas.isDrawingMode;

  if (canvas.isDrawingMode) {
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
    }
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = 4;
  }

  canvas.renderAll();
  return canvas.isDrawingMode;
};

//  Deletes all currently selected objects from the canvas

export const deleteSelectedObjects = (canvasRef) => {
  if (!canvasRef.current) return;

  const canvas = canvasRef.current;
  const activeObjects = canvas.getActiveObjects();
  
  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // Explicitly notify the canvas that data was removed 
    // so our auto save listener triggers!
    canvas.fire('object:removed');
  }
};

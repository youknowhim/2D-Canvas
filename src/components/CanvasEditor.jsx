import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// 1. Grab the capitalized Canvas element container from the version 6 bundle
import { Canvas } from 'fabric'; 

import { 
  addRectangle, 
  addCircle, 
  addText, 
  togglePenMode, 
  deleteSelectedObjects 
} from '../utils/fabricHelpers';
import { attachScroll, zoomBy } from '../utils/viewportHelpers';
import HelpPanel from './HelpPanel';
import '../styles/CanvasEditor.css';

function CanvasEditor() {
  const { canvasId } = useParams();
  const navigate = useNavigate();

  const canvasHTMLRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const [saveStatus, setSaveStatus] = useState("loading");
  const [activeColor, setActiveColor] = useState("#3498db");
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  // Guide is open when the editor loads; the user can close it with × or the ? button
  const [showHelp, setShowHelp] = useState(true);
  const toggleHelp = () => setShowHelp((v) => !v);

useEffect(() => {
  // 1. Start with the loading flag active
  let isInitialLoad = true;

  // Canvas fills the whole wrapper (everything not taken by the header and toolbar)
  const wrapperSize = () => ({
    width: canvasWrapperRef.current.clientWidth,
    height: canvasWrapperRef.current.clientHeight
  });

  // No background colour: the canvas stays transparent so the CSS grid behind it shows through
  fabricCanvasRef.current = new Canvas(canvasHTMLRef.current, wrapperSize());

  const handleResize = () => {
    fabricCanvasRef.current?.setDimensions(wrapperSize());
  };
  window.addEventListener('resize', handleResize);
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(canvasWrapperRef.current);

  const fetchCanvasSnapshot = async () => {
    try {
      const docRef = doc(db, "canvases", canvasId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.fabricData) {
          // 2. Modern Fabric v6 async promise pattern to prevent freezing
          const parsed = typeof data.fabricData === 'string' ? JSON.parse(data.fabricData) : data.fabricData;
          // Older saves carried a solid white background; the grid is CSS now, so drop it
          delete parsed.background;
          if (parsed.objects?.length > 0) {
            await fabricCanvasRef.current.loadFromJSON(parsed);
            fabricCanvasRef.current.renderAll();
          }
        }
        
        // 3. Open the lock only AFTER the data has successfully painted onto the screen
        isInitialLoad = false;
        setSaveStatus("saved");

      } else {
        setSaveStatus("error");
        navigate("/");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setSaveStatus("error");
      // Even if it fails, open the lock so the user can still use an empty canvas
      isInitialLoad = false; 
    }
  };

  fetchCanvasSnapshot();
  
  const handleCanvasModification = () => {
    // If the database is still loading structural data, exit immediately!
    if (isInitialLoad) return;
    setSaveStatus("unsaved");
  };

  // Attach event observers
  fabricCanvasRef.current.on('object:modified', handleCanvasModification);
  fabricCanvasRef.current.on('object:added', handleCanvasModification);
  fabricCanvasRef.current.on('object:removed', handleCanvasModification);
  fabricCanvasRef.current.on('text:changed', handleCanvasModification);

  // 5. Mouse wheel scrolls the canvas
  const detachScroll = attachScroll(fabricCanvasRef.current, setZoom);

  return () => {
    if(saveStatus === "unsaved") {
      const confirmLeave = window.alert("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) {
        return;
      }
    }
    window.removeEventListener('resize', handleResize);
    resizeObserver.disconnect();
    detachScroll();
    fabricCanvasRef.current?.dispose();
  };
}, [canvasId, navigate]);


  const executeCloudSync = async () => {
    if (!fabricCanvasRef.current) return;
    setSaveStatus("saving");
    try {
      // Commit any in-progress text edit so the typed text is part of the snapshot
      const activeObj = fabricCanvasRef.current.getActiveObject();
      if (activeObj?.isEditing) activeObj.exitEditing();

      const canvasPayloadSnapshot = fabricCanvasRef.current.toJSON();
      const docRef = doc(db, "canvases", canvasId);
      await updateDoc(docRef, {
        fabricData: JSON.stringify(canvasPayloadSnapshot),
        updatedAt: new Date().toISOString()
      });
      setSaveStatus("saved");
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
    }
  };

  const statusConfig = {
    loading: { label: "Loading...", color: "#9ca3af" },
    saved: { label: "All changes saved", color: "#16a34a" },
    unsaved: { label: "Unsaved changes", color: "#f59e0b" },
    saving: { label: "Saving...", color: "#2563eb" },
    error: { label: "Save failed", color: "#dc2626" }
  };

  const handleColorChange = (e) => {
    setActiveColor(e.target.value);
    const activeObj = fabricCanvasRef.current?.getActiveObject();
    if (activeObj) {
      activeObj.set('fill', e.target.value);
      fabricCanvasRef.current.renderAll();
      fabricCanvasRef.current.fire('object:modified');
    }
  };
  const go_Home=()=>{
    if(saveStatus === "unsaved" && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
    navigate("/");
  }
  useEffect(() => {
  if (saveStatus !== "unsaved") return;
  const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
  window.addEventListener("beforeunload", warn);
  return () => window.removeEventListener("beforeunload", warn);
}, [saveStatus]);

  return (
    <div className="editor">

      {/* Top bar — mirrors the browser-frame mock on the landing page */}
      <header className="topbar">
        <div className="topbar__group">
          <button className="topbar__home" onClick={go_Home} title="Back to home">
            <span className="topbar__dot" /><span className="topbar__dot" /><span className="topbar__dot" />
          </button>
          <span className="topbar__url" title="This canvas's link">/canvas/{canvasId}</span>
        </div>
        <div className="topbar__group">
          <span className="status">
            <span className="status__dot" style={{ background: statusConfig[saveStatus]?.color }} />
            {statusConfig[saveStatus]?.label}
          </span>
          <button
            className={`btn ${saveStatus === "unsaved" ? "btn--primary" : ""}`}
            onClick={executeCloudSync}
            disabled={saveStatus === "loading" || saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "Saving…" : "Save"}
          </button>
          <button className={`btn btn--icon ${showHelp ? "btn--active" : ""}`} onClick={toggleHelp} title="How to use">?</button>
        </div>
      </header>

      <div className="editor__body">

        {/* Tool rail */}
        <aside className="rail">
          <button className="tool" onClick={() => addRectangle(fabricCanvasRef, activeColor)} title="Rectangle">▭</button>
          <button className="tool" onClick={() => addCircle(fabricCanvasRef, activeColor)} title="Circle">○</button>
          <button className="tool tool--text" onClick={() => addText(fabricCanvasRef, activeColor)} title="Text">T</button>
          <button
            className={`tool ${isDrawing ? "tool--active" : ""}`}
            onClick={() => setIsDrawing(togglePenMode(fabricCanvasRef, activeColor))}
            title={isDrawing ? "Pen (on) — click to stop drawing" : "Pen"}
          >
            ✎
          </button>

          <div className="rail__gap" />

          <label className="swatch" title="Colour — applies to the selected object and new shapes">
            <input type="color" value={activeColor} onChange={handleColorChange} />
            <span className="swatch__fill" style={{ background: activeColor }} />
          </label>

          <button className="tool tool--danger" onClick={() => deleteSelectedObjects(fabricCanvasRef)} title="Delete selected">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </aside>

        {/* Canvas */}
        <div ref={canvasWrapperRef} className="editor__canvas">
          <canvas ref={canvasHTMLRef} />

          <div className="hintbar">
            <span>Drag to move</span>
            <span>Corners to resize</span>
            <span>Top handle to rotate</span>
            <span>Double-click text to edit</span>
            <span>Scroll to pan</span>
          </div>

          <div className="zoom">
            <button className="zoom__btn" onClick={() => setZoom(zoomBy(fabricCanvasRef.current, 0.9))} title="Zoom out">−</button>
            <span className="zoom__value">{Math.round(zoom * 100)}%</span>
            <button className="zoom__btn" onClick={() => setZoom(zoomBy(fabricCanvasRef.current, 1.1))} title="Zoom in">+</button>
          </div>
        </div>

        {/* Guide */}
        {showHelp && <HelpPanel onClose={toggleHelp} />}
      </div>
    </div>
  );
}

export default CanvasEditor;

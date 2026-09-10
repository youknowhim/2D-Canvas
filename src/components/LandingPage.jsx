import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/LandingPage.css';


function LandingPage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const createNewCanvas = async () => {
    setIsCreating(true);
    try {
      // 1. Generate a brand new document reference to let Firestore auto-create a Unique ID
      const newCanvasRef = doc(collection(db, "canvases"));
      const uniqueCanvasId = newCanvasRef.id;

      // 2. Setup the initial structural schema for our canvas document
      await setDoc(newCanvasRef, {
        canvasId: uniqueCanvasId,
        updatedAt: new Date().toISOString(),
        fabricData: { objects: [] } // Empty list of drawing objects to start
      });

      // 3. Immediately route the browser to the new custom workspace endpoint URL
      navigate(`/canvas/${uniqueCanvasId}`);
    } catch (error) {
      console.error("Error generating canvas:", error);
      alert("Failed to initialize canvas. Check Firestore permissions.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="landing">

      <nav className="landing__nav">
        <span className="landing__brand">
          <span className="landing__logo">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#fff" />
              <circle cx="10" cy="3.5" r="2.5" fill="#fff" opacity="0.85" />
              <path d="M1.5 12.5 C4 8, 8 13, 12.5 8.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          Canvas
        </span>
        <a className="landing__nav-link" href="https://github.com" target="_blank" rel="noreferrer">Source on GitHub</a>
      </nav>

      <main className="hero">
        <div>
          <h1 className="hero__title">
            A blank canvas,<br />one click away.
          </h1>
          <p className="hero__text">
            Draw boxes and circles, drop in some text, scribble with the pen.
            When you're done, hit save and it lives at a link you can open from anywhere.
          </p>
          <div className="hero__actions">
            <button className="hero__cta" onClick={createNewCanvas} disabled={isCreating}>
              {isCreating ? "Setting things up…" : "Start a new canvas"}
            </button>
            <span className="hero__note">No account. Nothing to install.</span>
          </div>
        </div>

        {/* Static preview of the editor */}
        <div className="mock" aria-hidden="true">
          <div className="mock__bar">
            <span className="mock__dot" /><span className="mock__dot" /><span className="mock__dot" />
            <span className="mock__url">/canvas/x7Qk2mR9</span>
          </div>
          <div className="mock__body">
            <div className="mock__tools">
              <span className="mock__tool">▭</span>
              <span className="mock__tool">○</span>
              <span className="mock__tool">T</span>
              <span className="mock__tool mock__tool--active">✎</span>
            </div>
            <div className="mock__canvas">
              <svg viewBox="0 0 440 300">
                {/* rectangle, selected */}
                <rect x="52" y="58" width="130" height="86" rx="4" fill="#2563eb" opacity="0.9" />
                <rect x="52" y="58" width="130" height="86" fill="none" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="4 3" />
                {[[52,58],[182,58],[52,144],[182,144]].map(([x, y]) => (
                  <rect key={`${x}${y}`} x={x - 4} y={y - 4} width="8" height="8" fill="#fff" stroke="#1d4ed8" strokeWidth="1.5" />
                ))}
                <line x1="117" y1="58" x2="117" y2="36" stroke="#1d4ed8" strokeWidth="1.5" />
                <circle cx="117" cy="32" r="4.5" fill="#fff" stroke="#1d4ed8" strokeWidth="1.5" />

                {/* circle */}
                <circle cx="300" cy="96" r="46" fill="#f59e0b" opacity="0.9" />

                {/* text */}
                <text x="56" y="205" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="600" fill="#111827">Weekly plan</text>
                <text x="56" y="228" fontFamily="system-ui, sans-serif" fontSize="13" fill="#6b7280">double-click to edit</text>

                {/* pen stroke */}
                <path d="M240 210 C265 170, 290 250, 320 200 S370 190, 400 240" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </main>

      <section className="steps">
        <div className="steps__inner">
          <div>
            <span className="step__num">1</span>
            <h3 className="step__title">Create</h3>
            <p className="step__text">
              Click the button and you get a fresh canvas with its own URL. That URL is the whole thing — bookmark it or send it to someone.
            </p>
          </div>
          <div>
            <span className="step__num">2</span>
            <h3 className="step__title">Draw</h3>
            <p className="step__text">
              Rectangles, circles, text and a freehand pen. Everything you add can be dragged around, resized, rotated and recoloured.
            </p>
          </div>
          <div>
            <span className="step__num">3</span>
            <h3 className="step__title">Save and come back</h3>
            <p className="step__text">
              One click saves the canvas to the cloud. Open the same link tomorrow, or on another machine, and it's exactly how you left it.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <span>Canvas — a small 2D editor</span>
        <span>React · Fabric.js · Firebase</span>
      </footer>
    </div>
  );
}

export default LandingPage;

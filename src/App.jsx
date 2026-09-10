import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CanvasEditor from './components/CanvasEditor';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dynamic Canvas Route */}
        <Route path="/canvas/:canvasId" element={<CanvasEditor />} />
      </Routes>
    </Router>
  );
}

export default App;

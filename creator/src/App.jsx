import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import Home from './Home.jsx';
import Editor from './Editor.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="container-fluid py-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="text-center py-3 text-muted small">
        &copy; {new Date().getFullYear()} Calico
      </footer>
    </BrowserRouter>
  );
}

export default App;

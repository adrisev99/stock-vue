import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home';
import StockData from './components/StockData/StockData';
import StockPredictions from './components/StockPredictions/StockPredictions';
import LandingPage from './components/LandingPage/LandingPage'; // Ensure correct import path
import Sidebar from './components/ui/sidebar';
import { StockProvider } from './context/StockContext';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <StockProvider>
      <Router>
        <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
          <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="flex-grow flex flex-col items-center p-4">
            <Routes>
              <Route path="/" element={<LandingPage />} /> {/* Ensure the landing page route */}
              <Route path="/dashboard" element={<Home />} />
              <Route path="/stock-data" element={<StockData />} />
              <Route path="/stock-predictions" element={<StockPredictions />} />
            </Routes>
          </main>
          <footer className="w-full p-4 bg-gray-200 dark:bg-gray-800 text-center">
            <p>&copy; 2024 Stock Data App. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </StockProvider>
  );
}

export default App;

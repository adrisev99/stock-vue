import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SparklesCore from '../ui/sparkles'; // Ensure correct import path
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const navigateToStockData = () => {
    navigate('/stock-data');
  };

  return (
    <div className="landing-page">
      <SparklesCore
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleDensity={400}
        className="sparkles-background"
        particleColor="#FFFFFF"
      />
      <motion.h1 
        className="landing-title text-black dark:text-white" 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1.2, opacity: 1 }} 
        transition={{ duration: 1, yoyo: Infinity }}
      >
        StockVue
      </motion.h1>
      <motion.p 
        className="landing-subtitle text-black dark:text-white"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Your Ultimate Stock Analysis & Prediction Tool
      </motion.p>
      <motion.div 
        className="landing-buttons"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <button className="btn-primary" onClick={navigateToStockData}>Get Started</button>
        <button className="btn-secondary" onClick={navigateToDashboard}>Learn More</button>
      </motion.div>
    </div>
  );
};

export default LandingPage;




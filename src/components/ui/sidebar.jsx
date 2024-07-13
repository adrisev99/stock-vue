import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconHome, IconSearch, IconChartBar, IconMoon, IconSun, IconMenu2 } from '@tabler/icons-react';
import { cn } from '../../utils/cn';
import './sidebar.css'; // Make sure to import the CSS file

const Sidebar = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={handleSidebarToggle} className="fixed top-4 left-4 z-50">
        <IconMenu2 size={24} />
      </button>
      <div
        className={cn(
          'sidebar-container',
          { 'translate-x-0': isOpen }
        )}
      >
        <button onClick={closeSidebar} className="close-btn">
          &times;
        </button>
        <nav className="p-4 mt-8"> {/* Add margin-top to move items down */}
          <ul className="space-y-4">
            <li>
              <Link to="/" onClick={closeSidebar} className="sidebar-item flex items-center space-x-2">
                <IconHome />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard" onClick={closeSidebar} className="sidebar-item flex items-center space-x-2">
                <IconHome />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/stock-data" onClick={closeSidebar} className="sidebar-item flex items-center space-x-2">
                <IconSearch />
                <span>Search Stocks</span>
              </Link>
            </li>
            <li>
              <Link to="/stock-predictions" onClick={closeSidebar} className="sidebar-item flex items-center space-x-2">
                <IconChartBar />
                <span>Predictions</span>
              </Link>
            </li>
            <li>
              <button onClick={toggleDarkMode} className="sidebar-item flex items-center space-x-2">
                {darkMode ? <IconSun /> : <IconMoon />}
                <span>Toggle Dark Mode</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

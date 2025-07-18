import React from 'react';

const GameLibraryHeader = ({ user, onProfileClick, onStoreClick, onLogout, searchTerm, onSearchChange, selectedFilter, onFilterChange }) => {
  const filters = [
    { value: 'all', label: 'All Games' },
    { value: 'available', label: 'Available' },
    { value: 'coming-soon', label: 'Coming Soon' },
    { value: 'locked', label: 'Locked' },
    { value: 'completed', label: 'Completed' }
  ];

  return (
    <div className="library-header">
      <div className="header-top">
        <div className="library-title">
          <h1 className="pixel-text">🎮 REDD GAME LIBRARY</h1>
          <span className="subtitle">Your Conservation Adventure Collection</span>
        </div>
        
        <div className="user-menu">
          <div className="user-info">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=4ade80&color=1a4d2e&size=40`}
              alt="User Avatar"
              className="user-avatar"
            />
            <div className="user-details">
              <span className="username pixel-text">{user?.username}</span>
              <span className="user-rank">{user?.rank || 'Novice'} • ⭐ {user?.rescueStars || 0}</span>
            </div>
          </div>
          
          <div className="menu-buttons">
            <button className="pixel-button secondary small" onClick={onProfileClick}>
              👤 PROFILE
            </button>
            <button className="pixel-button secondary small" onClick={onStoreClick}>
              🛒 STORE
            </button>
            <button className="pixel-button danger small" onClick={onLogout}>
              🚪 LOGOUT
            </button>
          </div>
        </div>
      </div>
      
      <div className="header-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input pixel-input"
          />
        </div>
        
        <div className="filter-section">
          {filters.map(filter => (
            <button
              key={filter.value}
              className={`filter-btn pixel-button ${selectedFilter === filter.value ? 'active' : 'secondary'} small`}
              onClick={() => onFilterChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLibraryHeader;
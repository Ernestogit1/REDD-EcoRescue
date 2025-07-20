import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/api/auth.api';
import { useGameLibrary } from '../../hooks/app/gameLibrary.hook';
import GameLibraryHeader from '../../components/app/gameLibrary/gameLibraryHeader.component';
import GameCard from '../../components/app/gameLibrary/gameCard.component';
import GameDetails from '../../components/app/gameLibrary/gameDetails.component';
import Loading from '../../components/common/loading.component';
import '../../styles/app/gameLibrary.style.css';

const AppScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const {
    games,
    selectedGame,
    searchTerm,
    selectedFilter,
    isLoading,
    setSearchTerm,
    setSelectedFilter,
    handleGameSelect,
    handlePlayGame,
    handleCloseModal,
    handleBackdropClick
  } = useGameLibrary();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleStoreClick = () => {
    console.log('Store coming soon!');
  };

  const handlePlay = (game) => {
    const route = handlePlayGame(game);
    
    // Only navigate if there's a route (internal games)
    if (route) {
      handleCloseModal(); // Close modal before navigation
      navigate(route);
    } else {
      // For external games, just close the modal
      handleCloseModal();
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return <Loading message="Loading your game library..." />;
  }

  return (
    <div className="app-screen">
      <div className="game-library-container">
        <GameLibraryHeader
          user={user}
          onProfileClick={handleProfileClick}
          onStoreClick={handleStoreClick}
          onLogout={handleLogout}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        
        <div className="library-content">
          <div className="games-grid full-width">
            {games.length === 0 ? (
              <div className="no-games-message">
                <div className="empty-state">
                  <div className="empty-icon">🎮</div>
                  <h3 className="pixel-text">No Games Found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              </div>
            ) : (
              games.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onGameSelect={handleGameSelect}
                  isSelected={selectedGame?.id === game.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Modal rendered outside main container */}
      {selectedGame && (
        <GameDetails
          selectedGame={selectedGame}
          onPlay={handlePlay}
          onClose={handleCloseModal}
          onBackdropClick={handleBackdropClick}
        />
      )}
    </div>
  );
};

export default AppScreen;
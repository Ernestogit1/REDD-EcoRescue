import React from 'react';
import { useGameLeaderboard } from '../../../hooks/app/gameLeaderboard.hooks';

const GameLeaderboards = ({ onBack }) => {
  const {
    leaderboards,
    loading,
    error,
    selectedGame,
    setSelectedGame,
    gameConfig,
    refreshLeaderboards
  } = useGameLeaderboard();

  const renderLeaderboardTable = (gameType, data) => {
    const config = gameConfig[gameType];
    
    if (!data || data.length === 0) {
      return (
        <div className="empty-leaderboard">
          <div className="empty-icon">🏆</div>
          <div className="empty-title">No Players Yet</div>
          <div className="empty-description">
            Be the first to play {config.title} and claim the top spot!
          </div>
        </div>
      );
    }

    return (
      <table className="leaderboard-table">
        <tbody>
          {data.slice(0, 10).map((player, index) => (
            <tr 
              key={player._id || index} 
              className={`leaderboard-row rank-${index + 1 <= 3 ? index + 1 : 'other'}`}
            >
              <td className={`leaderboard-cell rank-cell rank-${index + 1 <= 3 ? index + 1 : 'other'}`}>
                <span className="rank-number">
                  {index + 1}
                </span>
              </td>
              <td className="leaderboard-cell player-cell">
                <div className="player-name">{player.username || 'Anonymous'}</div>
                <div className="player-rank">{player.rank || 'Beginner'}</div>
              </td>
              <td className="leaderboard-cell score-cell">
                <div className="score-value">
                  {gameType === 'card' && `${player.completedGames || 0} wins`}
                  {gameType === 'puz' && `${player.completedGames || 0} solved`}
                  {gameType === 'match' && `${player.highestScore || 0} pts`}
                  {gameType === 'color' && `${player.imagesCreated || 0} arts`}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className="leaderboard-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Leaderboards...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-screen">
        <div className="error-container">
          <div className="error-text">⚠️ {error}</div>
          <button className="refresh-button" onClick={refreshLeaderboards}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const currentGameConfig = gameConfig[selectedGame];

  return (
    <div className="leaderboard-screen">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">🏆 GAME LEADERBOARDS</h1>
        <p className="leaderboard-subtitle">Champions of Conservation Gaming</p>
      </div>

      <div className="leaderboard-nav">
        <button className="back-button" onClick={onBack}>
          ⬅️ Back to Library
        </button>
        <button className="refresh-button" onClick={refreshLeaderboards}>
          🔄 Refresh
        </button>
      </div>

      <div className="game-tabs">
        {Object.entries(gameConfig).map(([gameType, config]) => (
          <button
            key={gameType}
            className={`game-tab ${selectedGame === gameType ? 'active' : ''}`}
            onClick={() => setSelectedGame(gameType)}
            style={{
              '--game-color': config.color,
              '--game-accent': config.accent
            }}
          >
            <span className="game-tab-icon">{config.icon}</span>
            <span>{config.title}</span>
          </button>
        ))}
      </div>

      <div className="leaderboard-content">
        <div 
          className="game-leaderboard-section"
          style={{
            borderColor: currentGameConfig.accent,
            background: `linear-gradient(135deg, ${currentGameConfig.color}20, ${currentGameConfig.color}05)`
          }}
        >
          <div className="section-header">
            <div 
              className="section-icon"
              style={{ color: currentGameConfig.accent }}
            >
              {currentGameConfig.icon}
            </div>
            <div>
              <h2 
                className="section-title"
                style={{ color: currentGameConfig.accent }}
              >
                {currentGameConfig.title}
              </h2>
              <p className="section-description">
                {currentGameConfig.description}
              </p>
            </div>
          </div>
          
          {renderLeaderboardTable(selectedGame, leaderboards[selectedGame])}
        </div>
      </div>
    </div>
  );
};

export default GameLeaderboards;
import React from 'react';

const ProfileAchievements = ({ achievements }) => {
  return (
    <div className="achievements-section">
      <h3 className="pixel-text section-title">Achievements</h3>
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-name">{achievement.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileAchievements;
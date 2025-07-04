import React from 'react';

const ProfileHeader = ({ 
  profile, 
  userStats, 
  isEditing, 
  editData, 
  isUpdating, 
  onInputChange, 
  onAvatarUpload 
}) => {
  return (
    <div className="profile-header">
      <div className="avatar-section">
        <div className="avatar-frame">
          <div className="user-avatar">
            {profile?.avatar || '🌲'}
          </div>
          <button className="avatar-upload-btn" onClick={onAvatarUpload}>
            📷
          </button>
        </div>
        <div className="user-title">
          <h2 className="pixel-text username">
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={onInputChange}
                className="pixel-input-small"
                disabled={isUpdating}
              />
            ) : (
              profile?.username || 'Eco Warrior'
            )}
          </h2>
          <div className="user-rank">{userStats.rank}</div>
        </div>
      </div>

      <div className="level-section">
        <div className="level-badge">
          <span className="level-text">LVL</span>
          <span className="level-number">{userStats.level}</span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar">
            <div 
              className="xp-fill" 
              style={{ width: `${(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100}%` }}
            ></div>
          </div>
          <div className="xp-text">
            {userStats.xp} / {userStats.xp + userStats.xpToNext} XP
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
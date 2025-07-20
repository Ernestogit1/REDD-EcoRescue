import React from 'react';

const ProfileHeader = ({ 
  profile, 
  userStats, 
  isEditing, 
  editData, 
  isUpdating, 
  onInputChange, 
  onAvatarUpload,
  previewImage 
}) => {
  const getAvatarSrc = () => {
    // 1. Show preview image if user selected a new one
    if (previewImage) return previewImage;
    
    // 2. Show Cloudinary image if it exists (after successful upload)
    if (profile?.avatar) return profile.avatar;
    
    // 3. Fallback to generated avatar with user's name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=4ade80&color=1a4d2e&size=200`;
  };

  return (
    <div className="profile-header">
      <div className="avatar-section">
        <div className="avatar-frame">
          <img
            src={getAvatarSrc()}
            alt="User Avatar"
            className="user-avatar"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              borderRadius: '50%'
            }}
          />
          {isEditing && (
            <button className="avatar-upload-btn" onClick={onAvatarUpload}>
              📷
            </button>
          )}
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
                placeholder="Enter username"
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
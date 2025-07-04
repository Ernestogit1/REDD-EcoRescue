import React from 'react';

const ProfileInfo = ({ 
  profile, 
  isEditing, 
  editData, 
  isUpdating, 
  onInputChange 
}) => {
  return (
    <div className="profile-info">
      <h3 className="pixel-text section-title">User Information</h3>
      <div className="info-row">
        <span className="info-label">Email:</span>
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={onInputChange}
            className="pixel-input-small"
            disabled={isUpdating}
          />
        ) : (
          <span className="info-value">{profile?.email || 'eco@warrior.com'}</span>
        )}
      </div>
      <div className="info-row">
        <span className="info-label">Joined:</span>
        <span className="info-value">
          {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'January 2024'}
        </span>
      </div>
    </div>
  );
};

export default ProfileInfo;
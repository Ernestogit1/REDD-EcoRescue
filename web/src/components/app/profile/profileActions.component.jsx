import React from 'react';

const ProfileActions = ({ 
  isEditing, 
  isUpdating, 
  onEdit, 
  onSave, 
  onCancel, 
  onLogout, 
  onBack 
}) => {
  return (
    <div className="profile-actions">
      {isEditing ? (
        <>
          <button 
            className="pixel-button success" 
            onClick={onSave}
            disabled={isUpdating}
          >
            {isUpdating ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
          <button 
            className="pixel-button secondary" 
            onClick={onCancel}
            disabled={isUpdating}
          >
            CANCEL
          </button>
        </>
      ) : (
        <button className="pixel-button primary" onClick={onEdit}>
          EDIT PROFILE
        </button>
      )}
      
      <button className="pixel-button danger" onClick={onLogout}>
        LOGOUT
      </button>
      <button className="pixel-button" onClick={onBack}>
        BACK TO MENU
      </button>
    </div>
  );
};

export default ProfileActions;
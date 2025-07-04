import React from 'react';
import ProfileHeader from '../../components/app/profile/profileHeader.component';
import ProfileStats from '../../components/app/profile/profileStats.component';
import ProfileInfo from '../../components/app/profile/profileInfo.component';
import ProfileAchievements from '../../components/app/profile/profileAchievment.component';
import ProfileActions from '../../components/app/profile/profileActions.component';
import ErrorMessage from '../../components/common/error.component';
import SuccessMessage from '../../components/common/success.component';
import '../../styles/app/profile.style.css';

const ProfileLayout = ({ 
  profile, 
  error, 
  updateSuccess, 
  isEditing, 
  editData, 
  isUpdating, 
  onInputChange, 
  onAvatarUpload,
  onEdit,
  onSave,
  onCancel,
  onLogout,
  onBack,
  userStats 
}) => {
  return (
    <div className="profile-container">
      <div className="profile-background">
        <div className="pixel-clouds"></div>
        <div className="floating-animals">
          <div className="animal-sprite">🦋</div>
          <div className="animal-sprite">🐝</div>
          <div className="animal-sprite">🐿️</div>
        </div>
      </div>

      <div className="profile-card">
        {/* Error and Success Messages */}
        <ErrorMessage error={error} />
        <SuccessMessage 
          success={updateSuccess} 
          message="Profile updated successfully!" 
        />

        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          userStats={userStats}
          isEditing={isEditing}
          editData={editData}
          isUpdating={isUpdating}
          onInputChange={onInputChange}
          onAvatarUpload={onAvatarUpload}
        />

        {/* Profile Stats */}
        <ProfileStats userStats={userStats} />

        {/* Profile Info */}
        <ProfileInfo
          profile={profile}
          isEditing={isEditing}
          editData={editData}
          isUpdating={isUpdating}
          onInputChange={onInputChange}
        />

        {/* Achievements */}
        <ProfileAchievements achievements={userStats.achievements} />

        {/* Actions */}
        <ProfileActions
          isEditing={isEditing}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          onLogout={onLogout}
          onBack={onBack}
        />
      </div>
    </div>
  );
};

export default ProfileLayout;
import React from 'react';
import { useProfile } from '../../hooks/app/profile.hook';
import ProfileLayout from '../../layouts/app/profile.layout';
import Loading from '../../components/common/loading.component';

const ProfileScreen = () => {
  const {
    profile,
    isLoading,
    isUpdating,
    error,
    updateSuccess,
    isEditing,
    editData,
    userStats,
    handleBack,
    handleLogout,
    handleEdit,
    handleSave,
    handleCancel,
    handleInputChange,
    handleAvatarUpload
  } = useProfile();

  if (isLoading) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <ProfileLayout
      profile={profile}
      error={error}
      updateSuccess={updateSuccess}
      isEditing={isEditing}
      editData={editData}
      isUpdating={isUpdating}
      userStats={userStats}
      onInputChange={handleInputChange}
      onAvatarUpload={handleAvatarUpload}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      onLogout={handleLogout}
      onBack={handleBack}
    />
  );
};

export default ProfileScreen;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/api/auth.api';
import { getUserProfile } from '../../store/api/user.api';
import { clearError, clearUpdateSuccess } from '../../store/slices/user.slice';
import '../../styles/app/profile.style.css';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Get user profile state
  const { 
    profile, 
    isLoading, 
    isUpdating, 
    error, 
    updateSuccess 
  } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: profile?.username || '',
    email: profile?.email || ''
  });

  // Fetch profile data on component mount
  useEffect(() => {
    if (!profile && isAuthenticated) {
      dispatch(getUserProfile());
    }
  }, [dispatch, profile, isAuthenticated]);

  // Update edit data when profile data changes
  useEffect(() => {
    if (profile) {
      setEditData({
        username: profile.username || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  // Handle update success
  useEffect(() => {
    if (updateSuccess) {
      setIsEditing(false);
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleBack = () => {
    navigate('/app');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    dispatch(clearError());
  };

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(editData)).unwrap();
      // Success is handled by useEffect above
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: profile?.username || '',
      email: profile?.email || ''
    });
    setIsEditing(false);
    dispatch(clearError());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload functionality
    console.log('Avatar upload clicked');
  };

  // Mock user stats - replace with real data later
  const userStats = {
    level: 15,
    xp: profile?.rescueStars || 0,
    xpToNext: 650,
    rescuePoints: profile?.rescueStars || 0,
    animalsRescued: 23,
    treesPlanted: 156,
    rank: profile?.rank || 'Forest Guardian',
    achievements: [
      { id: 1, name: 'First Rescue', icon: '🦁', unlocked: true },
      { id: 2, name: 'Tree Hugger', icon: '🌳', unlocked: true },
      { id: 3, name: 'Ocean Saver', icon: '🐋', unlocked: false },
      { id: 4, name: 'Climate Hero', icon: '🌍', unlocked: true },
      { id: 5, name: 'Master Rescuer', icon: '👑', unlocked: false }
    ]
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-spinner pixel-text">
            🌲 Loading profile...
          </div>
        </div>
      </div>
    );
  }

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
        {/* Error display */}
        {error && (
          <div className="error-message pixel-text">
            ❌ {error}
          </div>
        )}

        {/* Success message */}
        {updateSuccess && (
          <div className="success-message pixel-text">
            ✅ Profile updated successfully!
          </div>
        )}

        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-frame">
              <div className="user-avatar">
                {profile?.avatar || '🌲'}
              </div>
              <button className="avatar-upload-btn" onClick={handleAvatarUpload}>
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
                    onChange={handleInputChange}
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

        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{userStats.rescuePoints}</div>
            <div className="stat-label">Rescue Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🦁</div>
            <div className="stat-value">{userStats.animalsRescued}</div>
            <div className="stat-label">Animals Rescued</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🌳</div>
            <div className="stat-value">{userStats.treesPlanted}</div>
            <div className="stat-label">Trees Planted</div>
          </div>
        </div>

        <div className="profile-info">
          <h3 className="pixel-text section-title">User Information</h3>
          <div className="info-row">
            <span className="info-label">Email:</span>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleInputChange}
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

        <div className="achievements-section">
          <h3 className="pixel-text section-title">Achievements</h3>
          <div className="achievements-grid">
            {userStats.achievements.map((achievement) => (
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

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button 
                className="pixel-button success" 
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
              <button 
                className="pixel-button secondary" 
                onClick={handleCancel}
                disabled={isUpdating}
              >
                CANCEL
              </button>
            </>
          ) : (
            <button className="pixel-button primary" onClick={handleEdit}>
              EDIT PROFILE
            </button>
          )}
          
          <button className="pixel-button danger" onClick={handleLogout}>
            LOGOUT
          </button>
          <button className="pixel-button" onClick={handleBack}>
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
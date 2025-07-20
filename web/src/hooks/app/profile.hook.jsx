import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/api/auth.api';
import { getUserProfile, updateUserProfile } from '../../store/api/user.api';
import { clearError, clearUpdateSuccess } from '../../store/slices/user.slice';

export const useProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { 
    profile, 
    isLoading, 
    isUpdating, 
    error, 
    updateSuccess 
  } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: profile?.username || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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

  useEffect(() => {
    if (!profile && isAuthenticated) {
      dispatch(getUserProfile());
    }
  }, [dispatch, profile, isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setEditData({
        username: profile.username || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (updateSuccess) {
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewImage(null);
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

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
      const updateData = {
        username: editData.username
      };

      // Add file if selected
      if (selectedFile) {
        updateData.avatarFile = selectedFile;
      }

      await dispatch(updateUserProfile(updateData)).unwrap();
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: profile?.username || ''
    });
    setSelectedFile(null);
    setPreviewImage(null);
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size too large. Please select an image under 5MB.');
          return;
        }
        
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    updateSuccess,
    isEditing,
    editData,
    userStats,
    previewImage,
    handleBack,
    handleLogout,
    handleEdit,
    handleSave,
    handleCancel,
    handleInputChange,
    handleAvatarUpload
  };
};
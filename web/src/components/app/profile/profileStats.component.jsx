import React from 'react';

const ProfileStats = ({ userStats }) => {
  const stats = [
    {
      icon: '🏆',
      value: userStats.rescuePoints,
      label: 'Rescue Points'
    },
    {
      icon: '🦁',
      value: userStats.animalsRescued,
      label: 'Animals Rescued'
    },
    {
      icon: '🌳',
      value: userStats.treesPlanted,
      label: 'Trees Planted'
    }
  ];

  return (
    <div className="profile-stats">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
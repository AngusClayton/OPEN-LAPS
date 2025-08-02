
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [groupId, setGroupId] = useState('');
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    const newGroupId = Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem('groupId', newGroupId);
    navigate('/map');
  };

  const handleJoinGroup = () => {
    if (groupId) {
      sessionStorage.setItem('groupId', groupId);
      navigate('/map');
    }
  };

  return (
    <div>
      <h1>Jordan Tracker</h1>
      <input
        type="text"
        placeholder="Enter Group ID"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      />
      <button onClick={handleJoinGroup}>Join Group</button>
      <hr />
      <button onClick={handleCreateGroup}>Create New Group</button>
    </div>
  );
};

export default LandingPage;

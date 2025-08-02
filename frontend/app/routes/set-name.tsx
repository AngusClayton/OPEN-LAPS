import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";


const SetName: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any pending group ID if the user navigates away or refreshes
    return () => {
      sessionStorage.removeItem('pendingDriveGroupId');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('driverName', name);
      const pendingGroupId = sessionStorage.getItem('pendingDriveGroupId');
      if (pendingGroupId) {
        sessionStorage.setItem('groupId', pendingGroupId);
        sessionStorage.removeItem('pendingDriveGroupId'); // Clear after use
      }
      navigate('/drive');
    }
  };

  return (
    <div>
      <h1>Set Your Name</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button type="submit">Save and Drive</button>
      </form>
    </div>
  );
};

export default SetName;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Landing() {
  const [groupId, setGroupId] = useState("");
  const [existingGroupId, setExistingGroupId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedGroupId = sessionStorage.getItem("groupId");
    if (storedGroupId) {
      setExistingGroupId(storedGroupId);
    }
  }, []);

  const createGroup = () => {
    const newGroupId = Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem("groupId", newGroupId);
    navigate(`/group/${newGroupId}`);
  };

  const joinGroup = () => {
    if (groupId) {
      sessionStorage.setItem("groupId", groupId);
      navigate(`/group/${groupId}`);
    }
  };

  const goToGroup = () => {
    if (existingGroupId) {
      navigate(`/group/${existingGroupId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Jordan Tracker</h1>
      {existingGroupId ? (
        <div className="flex flex-col items-center">
          <p className="mb-4">Group ID: {existingGroupId} already exists.</p>
          <button
            onClick={goToGroup}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Group
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="Enter Group ID"
              className="border border-gray-400 p-2 rounded"
            />
            <button
              onClick={joinGroup}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
            >
              Join Group
            </button>
          </div>
          <div>
            <button
              onClick={createGroup}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";


// --- Helper: Icon Components (using inline SVG for portability) ---
const UsersIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2.1 12.9A1 1 0 0 0 3 14h13v3c0 .6.4 1 1 1z" />
    <path d="M12 10V7h3" />
    <circle cx="6.5" cy="17.5" r="2.5" />
    <circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);

const PlusCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const ArrowRightIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const LogOutIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);


export default function Landing() {
  const [groupId, setGroupId] = useState("");
  const [existingGroupId, setExistingGroupId] = useState < string | null > (null);
  //const navigate = useNavigate();
  const navigate = useNavigate();

  // On component mount, check if a group ID already exists in session storage.
  useEffect(() => {
    const storedGroupId = window.sessionStorage.getItem("groupId");
    if (storedGroupId) {
      setExistingGroupId(storedGroupId);
    }
  }, []);

  /**
   * Creates a new group with a random ID, stores it in session storage,
   * and navigates to the group page.
   */
  const createGroup = () => {
    const newGroupId = Math.random().toString(36).substring(2, 8).toUpperCase();
    window.sessionStorage.setItem("groupId", newGroupId);
    // Also update the state to reflect the new group immediately
    setExistingGroupId(newGroupId); 
    //navigate(`/group/${newGroupId}`);
  };

  /**
   * Joins a group using the ID from the input field.
   */
  const joinGroup = () => {
    if (groupId) {
      window.sessionStorage.setItem("groupId", groupId);
      setExistingGroupId(groupId); // Update state to show the new group
      //navigate(`/group/${groupId}`);
      //setGroupId(""); // Clear input field after joining
    }
  };

  /**
   * Navigates to the page for the already existing group.
   */
  const goToGroup = () => {
    if (existingGroupId) {
      navigate(`/group/${existingGroupId}`);
    }
  };
  
  /**
   * Removes the current group from session storage and updates the state,
   * returning the user to the default view.
   */
  const leaveGroup = () => {
      window.sessionStorage.removeItem("groupId");
      setExistingGroupId(null);
  };

  /**
   * Handles the action to drive for a specific group.
   * It checks for a driver's name in local storage and redirects
   * to a name setup page if not found.
   * @param {string} id - The ID of the group to drive for.
   */
  const handleDriveForGroup = (id) => {
    if (!id) return; // Don't do anything if the ID is empty
    const driverName = window.localStorage.getItem('driverName');
    if (!driverName) {
      window.sessionStorage.setItem('pendingDriveGroupId', id);
      navigate('/set-name');
    } else {
      window.sessionStorage.setItem('groupId', id);
      navigate('/drive');
    }
  };

  return (
    <div className="bg-slate-900 text-white font-sans">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-5xl font-extrabold tracking-tight mb-2
                           bg-gradient-to-r from-purple-400 via-indigo-400 to-green-400
                           text-transparent bg-clip-text">
              openLaps
            </h1>
            <p className="text-slate-400">
              Track your group's trackday in real-time, only a phone required!
            </p>
          </header>

          <main className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-6">
            {/* --- Current Group View (Conditional) --- */}
            {existingGroupId && (
                 <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 mb-2">You are currently in group:</p>
                    <p className="text-2xl font-bold text-white bg-slate-700/50 rounded-lg px-4 py-2 inline-block mb-6">
                        {existingGroupId}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <button
                        onClick={goToGroup}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all duration-200"
                        >
                        <UsersIcon className="h-5 w-5" />
                        Watch
                        </button>
                        <button
                        onClick={() => handleDriveForGroup(existingGroupId)}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-900 transition-all duration-200"
                        >
                        <CarIcon className="h-5 w-5" />
                        Drive 
                        </button>
                    </div>
                     <button
                        onClick={leaveGroup}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/80 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 transition-all duration-200"
                    >
                        <LogOutIcon className="h-5 w-5" />
                        Leave Group
                    </button>
                </div>
            )}

            {/* --- Separator (Conditional) --- */}
            {existingGroupId && (
                 <div className="flex items-center">
                    <hr className="w-full border-slate-600" />
                    <span className="px-4 text-slate-400 font-medium">ACTIONS</span>
                    <hr className="w-full border-slate-600" />
                </div>
            )}

            {/* --- Join Group Section --- */}
            <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-slate-300 mb-2">
                  {existingGroupId ? 'Join a Different Group' : 'Join an Existing Group'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="groupId"
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value.toUpperCase())}
                  placeholder="ENTER GROUP ID"
                  className="w-full flex-grow bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                />
                <button
                  onClick={joinGroup}
                  disabled={!groupId}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                  <span>Join</span>
                </button>
              </div>
            </div>

            {/* --- Separator --- */}
            <div className="flex items-center">
              <hr className="w-full border-slate-600" />
              <span className="px-4 text-slate-400 font-medium">OR</span>
              <hr className="w-full border-slate-600" />
            </div>

            {/* --- Create Group Section --- */}
            <button
              onClick={createGroup}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-200"
            >
              <PlusCircleIcon className="h-6 w-6"/>
              Create a New Group
            </button>
          </main>
          
          <footer className="text-center mt-8">
            <p className="text-sm text-slate-500">
                Footer goes here ai slop
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

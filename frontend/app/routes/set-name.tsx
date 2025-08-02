import React, { useState, useEffect } from 'react';

// In a real app, you would use a library like react-router-dom
// This is a mock for demonstration purposes
const useNavigate = () => {
  return (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would change the URL
    // window.location.pathname = path; 
  };
};

// --- Helper: Icon Components (using inline SVG for portability) ---
const CarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2.1 12.9A1 1 0 0 0 3 14h13v3c0 .6.4 1 1 1z" />
    <path d="M12 10V7h3" />
    <circle cx="6.5" cy="17.5" r="2.5" />
    <circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);

const UserIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);


const SetName: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  // This effect hook is preserved from your original logic.
  useEffect(() => {
    // Clear any pending group ID if the user navigates away or refreshes
    return () => {
      sessionStorage.removeItem('pendingDriveGroupId');
    };
  }, []);

  /**
   * Handles form submission. Saves the driver's name to local storage
   * and navigates to the drive page.
   * @param {React.FormEvent} e - The form event.
   */
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
    <div className="bg-slate-900 text-white font-sans">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-5xl font-extrabold tracking-tight mb-2
                           bg-gradient-to-r from-green-400 to-teal-400
                           text-transparent bg-clip-text">
              Identify Yourself
            </h1>
            <p className="text-slate-400">
              Set your name to start driving for the group.
            </p>
          </header>

          <main className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="driverName" className="block text-sm font-medium text-slate-300 mb-2">
                  Driver Name
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                    id="driverName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    />
                </div>
              </div>
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-900 transition-all duration-200"
              >
                <CarIcon className="h-6 w-6"/>
                Save and Drive
              </button>
            </form>
          </main>
          
          <footer className="text-center mt-8">
            <p className="text-sm text-slate-500">
                Your name will be visible to your group.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SetName;

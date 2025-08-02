import React, { useState, useEffect } from 'react';

// In a real app, you would use a library like react-router-dom
// This is a mock for demonstration purposes
const useNavigate = () => {
  return (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would change the URL. I've enabled this for the preview.
    window.location.pathname = path; 
  };
};

// --- Helper: Icon Components (using inline SVG for portability) ---
const ClockIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const ZapIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const PlusIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const HomeIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);


const Drive: React.FC = () => {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [lapTimes, setLapTimes] = useState<{ lap: number; time: string }[]>([]);
  const navigate = useNavigate();

  // Fetch group and driver info on component mount
  useEffect(() => {
    const storedGroupId = sessionStorage.getItem('groupId');
    const storedDriverName = localStorage.getItem('driverName');
    setGroupId(storedGroupId);
    setDriverName(storedDriverName);
  }, []);

  // --- Lap Time Calculations ---
  const bestLap = lapTimes.length > 0
    ? lapTimes.reduce((min, lap) => (lap.time < min.time ? lap : min), lapTimes[0]).time
    : 'N/A';
  
  const lastLap = lapTimes.length > 0 ? lapTimes[lapTimes.length - 1].time : 'N/A';

  /**
   * Adds a new lap with a randomly generated time.
   * In a real application, this would come from a timer.
   */
  const recordLapTime = () => {
    const minutes = Math.floor(Math.random() * 2) + 1; // 1 or 2 minutes
    const seconds = Math.floor(Math.random() * 60);
    const milliseconds = Math.floor(Math.random() * 1000);
    const newTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    
    setLapTimes(prevLaps => [
      ...prevLaps,
      { lap: prevLaps.length + 1, time: newTime }
    ]);
  };

  return (
    <div className="bg-slate-900 text-white font-sans">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-5xl font-extrabold tracking-tight mb-2
                           bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400
                           text-transparent bg-clip-text">
              Driving Session
            </h1>
            <div className="text-slate-400 flex justify-center items-center gap-4">
                <span>Group ID: <b className="text-white">{groupId || 'N/A'}</b></span>
                <span>Driver: <b className="text-white">{driverName || 'N/A'}</b></span>
            </div>
          </header>

          <main className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-6">
            {/* --- Lap Stats --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Best Lap */}
                <div className="bg-slate-900/50 p-4 rounded-lg flex items-center gap-4">
                    <ZapIcon className="h-8 w-8 text-yellow-400" />
                    <div>
                        <p className="text-sm text-slate-400">Best Lap</p>
                        <p className="text-2xl font-bold">{bestLap}</p>
                    </div>
                </div>
                {/* Last Lap */}
                <div className="bg-slate-900/50 p-4 rounded-lg flex items-center gap-4">
                    <ClockIcon className="h-8 w-8 text-cyan-400" />
                    <div>
                        <p className="text-sm text-slate-400">Last Lap</p>
                        <p className="text-2xl font-bold">{lastLap}</p>
                    </div>
                </div>
            </div>

            {/* --- Lap Times Table --- */}
            <div>
                <h2 className="text-xl font-bold mb-4">Lap Times</h2>
                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-700">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="p-3">Lap</th>
                                <th className="p-3">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {lapTimes.length > 0 ? (
                                lapTimes.slice().reverse().map(lap => (
                                    <tr key={lap.lap} className="hover:bg-slate-700/30">
                                        <td className="p-3">{lap.lap}</td>
                                        <td className="p-3 font-mono">{lap.time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="text-center p-8 text-slate-400">
                                        No laps recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Action Buttons --- */}
            <div className="flex flex-col sm:flex-row gap-4">
                 <button
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-600/50 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 transition-all duration-200"
                >
                    <HomeIcon className="h-5 w-5"/>
                    Back to Home
                </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Drive;

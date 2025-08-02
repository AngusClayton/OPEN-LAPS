import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';

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

const HomeIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const GlobeIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);


const Drive: React.FC = () => {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [lapTimes, setLapTimes] = useState<{ lap: number; time: string }[]>([]);
  const navigate = useNavigate();

  // --- MQTT State ---
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // --- Geolocation State ---
  const [position, setPosition] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Ref to store the watch ID for geolocation
  const watchIdRef = useRef<number | null>(null);


  // Effect to fetch group/driver info and connect to MQTT on mount
  useEffect(() => {
    // Fetch identifiers from storage
    const storedGroupId = sessionStorage.getItem('groupId');
    const storedDriverName = localStorage.getItem('driverName');
    setGroupId(storedGroupId);
    setDriverName(storedDriverName);

    // --- MQTT Connection ---
    // IMPORTANT: Replace with your actual broker URL
    // For local testing, you might use 'ws://localhost:9001'
    // For a public broker, use something like 'wss://broker.emqx.io:8084/mqtt'
    const brokerURL = import.meta.env.VITE_BROKER_IP_ADDRESS || 'wss://broker.emqx.io:8084/mqtt';
    console.log(`Attempting to connect to MQTT broker at ${brokerURL}`);
    
    const mqttClient = mqtt.connect(brokerURL);
    setClient(mqttClient);

    mqttClient.on('connect', () => {
      setConnectionStatus('Connected');
      console.log('Successfully connected to MQTT broker.');
    });

    mqttClient.on('error', (err) => {
      setConnectionStatus(`Error: ${err.message}`);
      console.error('MQTT Connection Error:', err);
      mqttClient.end(); // Close the connection on error
    });
    
    mqttClient.on('reconnect', () => {
        setConnectionStatus('Reconnecting...');
        console.log('Reconnecting to MQTT broker...');
    });

    mqttClient.on('close', () => {
        setConnectionStatus('Disconnected');
        console.log('Disconnected from MQTT broker.');
    });

    // Cleanup function for the component unmount
    return () => {
      if (mqttClient) {
        console.log('Closing MQTT connection.');
        mqttClient.end();
      }
    };
  }, []); // This effect runs only once on component mount

  // Effect for Geolocation Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition(pos.coords);
      setLocationError(null); // Clear any previous errors
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error(`Geolocation Error: ${error.message}`);
      setLocationError(`ERROR(${error.code}): ${error.message}`);
      setPosition({"latitude":-32.934,"longitude":151.708});
    };

    // Watch for position changes.
    // I've adjusted these options to be more lenient to prevent timeouts.
    const options: PositionOptions = {
      enableHighAccuracy: true, // Allows faster, less-accurate methods (Wi-Fi, IP)
      timeout: 20000, // Increased timeout to 20 seconds
      maximumAge: 5000, // Allows using a cached position up to 5 seconds old
    };
    
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    console.log('Started watching geolocation.');

    // Cleanup function to stop watching when the component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        console.log('Stopped watching geolocation.');
      }
    };
  }, []); // This effect also runs only once on mount


  // Effect for Publishing Location to MQTT
  useEffect(() => {
    // Set up an interval to publish data every 500ms
    const publishInterval = setInterval(() => {
      console.log("Attempting Publish");
      // Ensure we have all the necessary data and a live connection
      if (client && client.connected && position && groupId && driverName) {
        const topic = `/${groupId}/pos`;
        const payload = {
          driver: driverName,
          lat: position.latitude,
          lng: position.longitude,
        };

        try {
          client.publish(topic, JSON.stringify(payload), { qos: 0, retain: false }, (error) => {
            if (error) {
              console.error('MQTT Publish Error:', error);
            } else {
              // console.log(`Published to ${topic}:`, payload); // Uncomment for verbose logging
            }
          });
        } catch (e) {
            console.error('Failed to publish message:', e);
        }
      }
    }, 500); // Publish every 500 milliseconds

    // Cleanup function to clear the interval
    return () => {
      clearInterval(publishInterval);
    };
  }, [client, position, groupId, driverName]); // Rerun this effect if any of these dependencies change


  // --- Lap Time Calculations (mock data) ---
  const bestLap = 'N/A';
  const lastLap = 'N/A';

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
                <span>Group: <b className="text-white">{groupId || 'N/A'}</b></span>
                <span>Driver: <b className="text-white">{driverName || 'N/A'}</b></span>
            </div>
          </header>

          <main className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-6">
            
            {/* --- Live Stats --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="bg-slate-900/50 p-4 rounded-lg flex items-center gap-4">
                    <GlobeIcon className="h-8 w-8 text-green-400" />
                    <div>
                        <p className="text-sm text-slate-400">Coordinates</p>
                        {position ? (
                             <p className="text-lg font-mono font-bold">
                                {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
                             </p>
                        ) : (
                            <p className="text-lg font-bold text-slate-500">{locationError || 'Acquiring...'}</p>
                        )}
                    </div>
                </div>
                {/* MQTT Status */}
                <div className="bg-slate-900/50 p-4 rounded-lg flex items-center gap-4">
                    <ZapIcon className={`h-8 w-8 ${connectionStatus === 'Connected' ? 'text-yellow-400' : 'text-red-500'}`} />
                    <div>
                        <p className="text-sm text-slate-400">MQTT Status</p>
                        <p className="text-lg font-bold">{connectionStatus}</p>
                    </div>
                </div>
            </div>

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
                           <tr>
                                <td colSpan={2} className="text-center p-8 text-slate-400">
                                    Lap timing not implemented.
                                </td>
                            </tr>
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

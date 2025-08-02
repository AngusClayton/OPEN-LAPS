import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import GoogleMapReact from 'google-map-react';
import circuits from '../circuits.json';
import DriverMarker from '../components/DriverMarker';
import mqtt from 'mqtt';

const AnyReactComponent = ({ text }: { text: string }) => <div>{text}</div>;

  export default function Group() {
  const [mockLapTimes, setMockLapTimes] = useState([
    { driver: 'Driver 1', last: '1:23.456', lastTimestamp: '14:32', best: '1:22.123', bestTimestamp: '14:31', status: 'Live', position: { lat: -32.932557, lng: 151.704341 } },
    { driver: 'Driver 2', last: '1:24.789', lastTimestamp: '14:33', best: '1:23.999', bestTimestamp: '14:30', status: 'Live', position: { lat: 41.5700, lng: 2.2611 } },
    { driver: 'Driver 3', last: '1:22.999', lastTimestamp: '14:31', best: '1:22.999', bestTimestamp: '14:29', status: 'Live', position: { lat: 43.7347, lng: 7.4206 } },
  ]);
  const { groupId } = useParams();
  const [center, setCenter] = useState({ lat: 10.99835602, lng: 77.01502627 });
  const [zoom, setZoom] = useState(11);
  const [mapMode, setMapMode] = useState('roadmap');
  const [selectedCircuitName, setSelectedCircuitName] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapsRef = useRef<any>(null);
  const finishLineRef = useRef<google.maps.Polyline | null>(null);

  // -------------- MQTT
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [messages, setMessages] = useState([]);
  const [publishTopic, setPublishTopic] = useState('react/demo/publish');
  const [publishMessage, setPublishMessage] = useState('');
  
  useEffect(() => {
    
    const subscribeTopic = `/${groupId }/#`;
    const brokerURL = import.meta.env.VITE_BROKER_IP_ADDRESS;
    console.log("Broker at",brokerURL);
    const newClient = mqtt.connect(brokerURL);
    
    newClient.on('connect', () => {
      setConnectionStatus('Connected!');
      console.log('Connected to MQTT broker.');

      // Subscribe to the default topic after a successful connection.
      newClient.subscribe(subscribeTopic, (err) => {
        if (!err) {
          console.log(`Subscribed to topic: ${subscribeTopic}`);
          setMessages(prev => [...prev, { topic: 'System', message: `Subscribed to ${subscribeTopic}` }]);
        } else {
          console.error(`Subscription error: ${err}`);
        }
      });
    });

    newClient.on('message', (topic, message) => {
      const payload = message.toString();
      console.log(`Received message on topic "${topic}": ${payload}`);
      setMessages(prevMessages => [...prevMessages, { topic, message: payload }]);

      // If the topic ends with /pos and payload is a driver position update
      if (topic.endsWith('/pos')) {
        console.log("Recieved driver position message");
        try {
          const data = JSON.parse(payload);
          if (data.driver && typeof data.lat === 'number' && typeof data.lng === 'number') {
            setMockLapTimes(prevLapTimes => {
              // Update the position for the driver if found, else add new driver
              const found = prevLapTimes.some(lap => lap.driver === data.driver);
              if (found) {
                console.log("found match");
                return prevLapTimes.map(lap =>
                  lap.driver === data.driver
                    ? { ...lap, position: { lat: data.lat, lng: data.lng } }
                    : lap
                );
              } else {
                // Optionally add a new driver if not found
                return [
                  ...prevLapTimes,
                  {
                    driver: data.driver,
                    last: '',
                    lastTimestamp: '',
                    best: '',
                    bestTimestamp: '',
                    status: 'Live',
                    position: { lat: data.lat, lng: data.lng }
                  }
                ];
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse driver position payload:', e);
        }
      }
    });

    // Event handler for connection errors.
    newClient.on('error', (err) => {
      setConnectionStatus(`Error: ${err.message}`);
      console.error('MQTT Connection Error:', err);
      newClient.end();
    });
    

    // Cleanup function for the useEffect hook.
    // This is crucial to ensure the WebSocket connection is closed properly when the component unmounts.
    return () => {
      if (client) {
        client.end();
      }
    };


  },[]);
  


  // -------------- END MQTT




  const handleCircuitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const circuitName = event.target.value;
    if (circuitName && circuits[circuitName]) {
      const circuit = circuits[circuitName];
      setCenter({ lat: circuit.lat, lng: circuit.lng });
      setZoom(circuit.zoom);

      // Draw finish line
      if (mapRef.current && mapsRef.current) {
        if (finishLineRef.current) {
          finishLineRef.current.setMap(null); // Clear existing line
        }
        if (circuit.finishLine) {
          const newFinishLine = new mapsRef.current.Polyline({
            path: circuit.finishLine,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 5,
          });
          newFinishLine.setMap(mapRef.current);
          finishLineRef.current = newFinishLine;
        }
      }
    }
  };

  const handleMapModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMapMode(event.target.value);
  };

  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map, maps: any }) => {
    mapRef.current = map;
    mapsRef.current = maps;
  };

  useEffect(() => {
    if (mapRef.current && mapsRef.current && selectedCircuitName) {
      const circuit = circuits[selectedCircuitName];
      if (finishLineRef.current) {
        finishLineRef.current.setMap(null); // Clear existing line
      }
      if (circuit.finishLine) {
        const newFinishLine = new mapsRef.current.Polyline({
          path: circuit.finishLine,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });
        newFinishLine.setMap(mapRef.current);
        finishLineRef.current = newFinishLine;
      }
    }
  }, [mapRef.current, mapsRef.current, selectedCircuitName]);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="flex flex-col w-full lg:w-4/5 flex-grow flex-grow-2">
        <div className="p-4 bg-gray-800 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl font-bold text-white">Group ID: {groupId}</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            <select onChange={handleCircuitChange} className="p-2 rounded border sm:mr-2">
              <option value="">Select a Circuit</option>
              {Object.keys(circuits).map(circuitName => (
                <option key={circuitName} value={circuitName}>{circuitName}</option>
              ))}
            </select>
            <select onChange={handleMapModeChange} className="p-2 rounded border">
              <option value="roadmap">Roadmap</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>
        </div>
        <div className="flex-grow">
          <GoogleMapReact
            bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY }}
            center={center}
            zoom={zoom}
            options={{ mapTypeId: mapMode }}
            onGoogleApiLoaded={handleApiLoaded}
            yesIWantToUseGoogleMapApiInternals
          >
            {mockLapTimes.map((driver, index) => (
              <DriverMarker
                key={index}
                lat={driver.position.lat}
                lng={driver.position.lng}
                driverName={driver.driver}
              />
            ))}
          </GoogleMapReact>
        </div>
      </div>
      <div className="w-full lg:w-1/5 bg-gray-900 p-4 text-white flex-grow flex-grow-1">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Driver</th>
              <th className="text-left">Lap Times</th>
            </tr>
          </thead>
          <tbody>
            {mockLapTimes.map((lap, index) => (
              <tr key={index}>
                <td className="py-2">
                  <div className="font-bold text-lg">{lap.driver}</div>
                  {lap.status === 'Live' && (
                    <div className="text-sm text-green-500 flex items-center">
                      <span className="inline-block w-2 h-2 mr-1 rounded-full bg-green-500"></span>Live
                    </div>
                  )}
                </td>
                <td className="py-2">
                  <div><span className="text-xs">Last:</span> <span className="text-base">{lap.last}</span></div>
                  <div className="text-gray-400 text-sm">({lap.lastTimestamp})</div>
                  <div className="text-green-400"><span className="text-xs">Best:</span> <span className="text-base">{lap.best}</span></div>
                  <div className="text-gray-400 text-sm">({lap.bestTimestamp})</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useParams } from "react-router";
import GoogleMapReact from 'google-map-react';
import circuits from '../circuits.json';

const AnyReactComponent = ({ text }: { text: string }) => <div>{text}</div>;

const mockLapTimes = [
  { driver: 'Driver 1', last: '1:23.456', lastTimestamp: '14:32', best: '1:22.123', bestTimestamp: '14:31', status: 'Live' },
  { driver: 'Driver 2', last: '1:24.789', lastTimestamp: '14:33', best: '1:23.999', bestTimestamp: '14:30', status: 'Live' },
  { driver: 'Driver 3', last: '1:22.999', lastTimestamp: '14:31', best: '1:22.999', bestTimestamp: '14:29', status: 'Live' },
];

export default function Group() {
  const { groupId } = useParams();
  const [center, setCenter] = useState({ lat: 10.99835602, lng: 77.01502627 });
  const [zoom, setZoom] = useState(11);
  const [mapMode, setMapMode] = useState('roadmap');

  const handleCircuitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const circuitName = event.target.value;
    if (circuitName && circuits[circuitName]) {
      const circuit = circuits[circuitName];
      setCenter({ lat: circuit.lat, lng: circuit.lng });
      setZoom(circuit.zoom);
    }
  };

  const handleMapModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMapMode(event.target.value);
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-4/5">
        <div className="p-4 bg-gray-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Group ID: {groupId}</h1>
          <div>
            <select onChange={handleCircuitChange} className="p-2 rounded border mr-2">
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
          >
            <AnyReactComponent
              lat={59.955413}
              lng={30.337844}
              text="My Marker"
            />
          </GoogleMapReact>
        </div>
      </div>
      <div className="w-1/5 bg-gray-900 p-4 text-white">
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
import { useState } from "react";
import { useParams } from "react-router";
import GoogleMapReact from 'google-map-react';
import circuits from '../circuits.json';

const AnyReactComponent = ({ text }: { text: string }) => <div>{text}</div>;

export default function Group() {
  const { groupId } = useParams();
  const [center, setCenter] = useState({ lat: 10.99835602, lng: 77.01502627 });
  const [zoom, setZoom] = useState(11);

  const handleCircuitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const circuitName = event.target.value;
    if (circuitName && circuits[circuitName]) {
      const circuit = circuits[circuitName];
      setCenter({ lat: circuit.lat, lng: circuit.lng });
      setZoom(circuit.zoom);
    }
  };

  return (
    <div className="h-screen w-full">
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Group ID: {groupId}</h1>
        <select onChange={handleCircuitChange} className="p-2 rounded border">
          <option value="">Select a Circuit</option>
          {Object.keys(circuits).map(circuitName => (
            <option key={circuitName} value={circuitName}>{circuitName}</option>
          ))}
        </select>
      </div>
      <GoogleMapReact
        bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY }}
        center={center}
        zoom={zoom}
      >
        <AnyReactComponent
          lat={59.955413}
          lng={30.337844}
          text="My Marker"
        />
      </GoogleMapReact>
    </div>
  );
}
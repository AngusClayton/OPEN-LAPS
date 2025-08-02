import React from 'react';

interface DriverMarkerProps {
  lat: number;
  lng: number;
  driverName: string;
}

const DriverMarker: React.FC<DriverMarkerProps> = ({ lat, lng, driverName }) => {
  return (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2">
      <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
        {driverName.substring(0, 1)}
      </div>
      <div className="text-xs text-blue-500 font-bold mt-1 text-center">{driverName}</div>
    </div>
  );
};

export default DriverMarker;

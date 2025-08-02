
import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';

const MapPage = () => {
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    const storedGroupId = sessionStorage.getItem('groupId');
    if (storedGroupId) {
      setGroupId(storedGroupId);
    }
  }, []);

  const defaultProps = {
    center: {
      lat: 31.963158,
      lng: 35.930359
    },
    zoom: 11
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1>Group ID: {groupId}</h1>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyCaQqjXk2Ig-SjC8L7arPrtt2tMC6ikbK4" }} // Add your Google Maps API key here
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        {/* You can add markers here */}
      </GoogleMapReact>
    </div>
  );
};

export default MapPage;

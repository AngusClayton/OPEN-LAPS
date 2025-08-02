import { useParams } from "react-router";
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }: { text: string }) => <div>{text}</div>;

export default function Group() {
  const { groupId } = useParams();
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 11
  };

  return (
    <div className="h-screen w-full">
      <h1 className="text-2xl font-bold p-4">Group ID: {groupId}</h1>
      <GoogleMapReact
        bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
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
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useIonViewDidEnter } from '@ionic/react';
import 'leaflet/dist/leaflet.css';

interface JourneyMapProps {
  positions: [number, number][];
}

// Stupid hack to fix the maps rendering incorrectly.
const MapUpdater: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const JourneyMap: React.FC<JourneyMapProps> = ({ positions }) => {
  const mapRef = useRef<any>(null);
  const [key, setKey] = useState(0);
  const centre: [number, number] = [-12.35556, 130.88253]; // TODO: Calculate the centre based on the positions
  const redOptions = { color: 'red' };

  useIonViewDidEnter(() => {
    setKey(prev => prev + 1);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [key]);

  return (
    <MapContainer
      key={key}
      center={centre}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: '200px', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline pathOptions={redOptions} positions={positions} />
      <MapUpdater />
    </MapContainer>
  );
};

export default JourneyMap;
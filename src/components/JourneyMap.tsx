import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { useIonViewWillEnter } from '@ionic/react';
import 'leaflet/dist/leaflet.css';

interface JourneyMapProps {
  positions: [number, number][];
}

const JourneyMap: React.FC<JourneyMapProps> = ({ positions }) => {
  const mapRef = useRef<any>(null);
  const centre: [number, number] = [-12.35556, 130.88253]; // TODO: Calculate the centre based on the positions
  const redOptions = { color: 'red' };

  // Stupid hack to fix the maps rendering incorrectly.
  useIonViewWillEnter(() => {
    if (mapRef.current) {
      window.dispatchEvent(new Event('resize'));
      mapRef.current.invalidateSize();
    }
  });

  useEffect(() => {
    if (mapRef.current) {
      window.dispatchEvent(new Event('resize'));
      mapRef.current.invalidateSize();
    }
  }, []);

  return (
    <MapContainer
      center={centre}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: '200px', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline pathOptions={redOptions} positions={positions} />
    </MapContainer>
  );
};

export default JourneyMap;
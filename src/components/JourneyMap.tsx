import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker } from 'react-leaflet';
import { useIonViewDidEnter } from '@ionic/react';
import 'leaflet/dist/leaflet.css';

/* Stupid fix for Android/iOS showing Leaflet's icons as a broken image:
 * https://stackoverflow.com/questions/47723812/custom-marker-icon-with-react-leaflet
 */
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface JourneyMapProps {
  positions: [number, number][];
  centre?: [number, number];
}

const MapUpdater: React.FC<{ centre?: [number, number] }> = ({ centre }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (centre) {
      map.setView(centre);
    }
  }, [map, centre]);
  return null;
};

const JourneyMap: React.FC<JourneyMapProps> = ({ positions, centre }) => {
  const mapRef = useRef<any>(null);
  const [key, setKey] = useState(0);
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

  const mapCentre = centre || (() => {
    if (positions.length === 0) return [-12.35556, 130.88253]; // Default centre on RDH.
    const lats = positions.map(pos => pos[0]);
    const lngs = positions.map(pos => pos[1]);
    /* ... = spread operator. it "spreads" an array into individual arguments.
     * e.g. lats = [1, 2, 3], then Math.min(...lats) is equivalent to Math.min(1, 2, 3)
     * then it just finds the mean: x̄ = ( Σ xi ) / n.
     */
    return [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2] as [number, number];
  })();

  return (
    <MapContainer

      key={key}
      center={mapCentre}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: '300px', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline pathOptions={redOptions} positions={positions} />
      {centre && <Marker position={centre} />}
      <MapUpdater centre={centre} />
    </MapContainer>
  );
};

export default JourneyMap;
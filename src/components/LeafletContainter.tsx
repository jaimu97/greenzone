import './ContainerStyles.css';
import {IonContent, useIonViewWillEnter} from '@ionic/react';
import React, { useEffect, useRef } from "react";
import {MapContainer, TileLayer, useMapEvents, Polygon, FeatureGroup, Popup} from "react-leaflet";
import 'leaflet/dist/leaflet.css';

const LeafletContainer: React.FC = () => {
  const mapRef = useRef<any>(null);

  const hotZone = { color: 'red' }
  const warmZone = { color: 'orange' }
  const coolZone = { color: 'green' }

  const greenZone1 = [
    [-12.354480884842488, 130.88162899017337],
    [-12.354480884842488, 130.88143050670627],
    [-12.354381321177707, 130.88142514228824],
    [-12.354334159428543, 130.8813661336899],
    [-12.354245076101348, 130.8813446760178],
    [-12.35423983590468, 130.8811140060425],
    [-12.353768217775208, 130.88135004043582],
    [-12.353647693005717, 130.88121056556705],
    [-12.35360053112428, 130.88124811649325],
    [-12.353286118364087, 130.88072776794436],
    [-12.35289310188245, 130.88105499744418],
    [-12.353333280302202, 130.88151633739474],
    [-12.353338520517022, 130.88126420974734],
    [-12.35348000627754, 130.88126420974734],
    [-12.35349048670119, 130.88133931159976],
    [-12.353532408391635, 130.88133394718173],
    [-12.353548129023823, 130.88155388832095],
    [-12.3542503162979, 130.88155388832095],
    [-12.354271277083066, 130.88162899017337],
  ]

  const greenZone2 = [
    [-12.354451365226064, 130.88564693927768],
    [-12.354451365226064, 130.8835601806641],
    [-12.353983066139628, 130.8835601806641],
    [-12.353983066139628, 130.883903503418],
    [-12.354058350555104, 130.883903503418],
    [-12.354058350555104, 130.88564693927768],
  ]

  const greenZone3 = [
    [-12.354314159428543, 130.88166117668155],
    [-12.354314159428543, 130.88278234004977],
    [-12.354470404458517, 130.88278234004977],
    [-12.354470404458517, 130.88166117668155],
  ]

  /* Leaflet library seems to be a bit broken, requires this fix I found on GitHub to make it render properly:
   * https://github.com/PaulLeCam/react-leaflet/issues/902
   */

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

  // TEMPORARY: Remove me once all green zones are mapped, prints lat,lng console for vector layers
  function LocationLogger() {
    useMapEvents({
      click(e) {
        console.log(`[${e.latlng.lat}, ${e.latlng.lng}],`);
      },
    });
    return null;
  }

  // Gives a TypeScript error saying for positions saying "TS2322: Type number[][] is not assignable to type" but works anyway?
  return (
    <IonContent className="map-content">
      <MapContainer
        center={[-12.35556, 130.88253]}
        zoom={18}
        scrollWheelZoom={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup>
          <Popup>
            <h1>This zone is hot.</h1>
            <h2>It's like 1 billion degrees (in kelvin).</h2>
            <p>Real data will go here once that is implemented.</p>
          </Popup>
          <Polygon pathOptions={ hotZone } positions={greenZone1} />
        </FeatureGroup>
        <FeatureGroup>
          <Popup>
            <h1>This zone is cool.</h1>
            <h2>It is only -40f!</h2>
            <p>Real data will go here once that is implemented.</p>
          </Popup>
          <Polygon pathOptions={ coolZone } positions={greenZone2} />
        </FeatureGroup>
        <FeatureGroup>
          <Popup>
            <h1>This zone is medium.</h1>
            <h2>It is only 50 degrees celsius!</h2>
            <p>Real data will go here once that is implemented.</p>
          </Popup>
          <Polygon pathOptions={ warmZone } positions={greenZone3} />
        </FeatureGroup>
        <LocationLogger />
      </MapContainer>
    </IonContent>
  );
};

export default LeafletContainer;
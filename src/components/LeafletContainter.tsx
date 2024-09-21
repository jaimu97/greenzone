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

  const greenZone1: [number, number][] = [
    [-12.368760017845661, 130.8884954452515],
    [-12.368770497656815, 130.88869929313663],
    [-12.368822896706254, 130.8889997005463],
    [-12.36897485389019, 130.88938593864444],
    [-12.36868665915585, 130.8895039558411],
    [-12.368550421534419, 130.8895254135132],
    [-12.368424663666978, 130.8888012170792],
    [-12.368404663666978, 130.88852226734164],
    [-12.368760017845661, 130.8884954452515],
  ]

  const greenZone2: [number, number][] = [
    [-12.36893817457802, 130.88903188705447],
    [-12.36898009379151, 130.88927865028384],
    [-12.369200169551972, 130.88921427726748],
    [-12.370337224694437, 130.88835597038272],
    [-12.370148589160676, 130.88813066482547],
    [-12.370085710619144, 130.88752985000613],
    [-12.370033311822977, 130.88755130767825],
    [-12.369986152897447, 130.8877390623093],
    [-12.36989183502085, 130.8879750967026],
    [-12.369718918825289, 130.88805556297305],
    [-12.369121571087362, 130.8881199359894],
    [-12.369095371593914, 130.88824868202212],
    [-12.369153010476051, 130.88837742805484],
    [-12.36924208872343, 130.88891923427585],
    [-12.369147770578191, 130.88899433612826],
    [-12.36894865438201, 130.8890372514725],
  ]

  const greenZone3: [number, number][] = [
    [-12.368477062785768, 130.88742792606357],
    [-12.368471822874358, 130.88769078254703],
    [-12.3685347018043, 130.88787853717807],
    [-12.36866569952642, 130.8880823850632],
    [-12.368875295745173, 130.88811457157138],
    [-12.369084891795788, 130.88814139366153],
    [-12.369676999730354, 130.88808774948123],
    [-12.369865635604638, 130.8879911899567],
    [-12.369975673135057, 130.8877766132355],
    [-12.370012352301584, 130.887508392334],
    [-12.369970433253723, 130.8873796463013],
    [-12.369870875488083, 130.88719189167026],
    [-12.3697084390522, 130.8870202302933],
    [-12.369435964803897, 130.88695585727694],
    [-12.369074411997257, 130.88694512844089],
    [-12.36880717699252, 130.88699340820315],
    [-12.36856090135398, 130.88724017143252],
    [-12.368477062785768, 130.88742792606357],
  ]

  const greenZone4: [number,number][] = [
    [-12.368541196620836, 130.88722655305662],
    [-12.368452118134508, 130.8871729088763],
    [-12.369175224969743, 130.88584253320494],
    [-12.36964681530581, 130.88608393201628],
    [-12.370118404790622, 130.88631460199156],
    [-12.370107925033526, 130.8865399075488],
    [-12.369908809569125, 130.8865184498767],
    [-12.369804011895333, 130.88700124749937],
    [-12.369395300565833, 130.88692614564695],
    [-12.369080906800383, 130.88691005239284],
    [-12.368776992467485, 130.8869744254092],
    [-12.368530716800498, 130.88726946840086],
  ]

  const greenZone5: [number,number][] = [
    [-12.368456103139506, 130.88719725608829],
    [-12.368398464103633, 130.88731527328494],
    [-12.368356544796825, 130.88778197765353],
    [-12.368398464103633, 130.88833987712863],
    [-12.368435143491578, 130.88846862316134],
    [-12.368655219711057, 130.88844716548923],
    [-12.368697138969942, 130.88830769062045],
    [-12.369074411997257, 130.8882647752762],
    [-12.36909013169491, 130.88816821575168],
    [-12.368670939433937, 130.88810384273532],
    [-12.368508502251998, 130.887867808342],
    [-12.368445623315745, 130.88768005371097],
    [-12.36845086322769, 130.88742792606357],
    [-12.36851374216267, 130.88724017143252],
    [-12.36845086322769, 130.88719189167026],
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
        //center={[-12.35556, 130.88253]}
        center={[-12.369205409448764, 130.8875620365143]}
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
            <h1>Current Zone Temp: 31c</h1>
            <h3>It is currently +3c warmer than average.</h3>
            <p>Visits in the last hour: 3</p>
            <p>Average visit length: 0:30</p>
          </Popup>
          <Polygon pathOptions={ coolZone } positions={ greenZone1 } />
        </FeatureGroup>
        <FeatureGroup>
          <Popup>
            <h1>Current Zone Temp: 33c</h1>
            <h2>It is currently +2c warmer than average.</h2>
            <p>Visits in the last hour: 7</p>
            <p>Average visit length: 1:30</p>
          </Popup>
          <Polygon pathOptions={ warmZone } positions={ greenZone2 } />
        </FeatureGroup>
        <FeatureGroup>
          <Popup>
            <h1>Current Zone Temp: 37c</h1>
            <h2>It is currently +5c warmer than average.</h2>
            <p>Visits in the last hour: 1</p>
            <p>Average visit length: 0:15</p>
          </Popup>
          <Polygon pathOptions={ hotZone } positions={ greenZone3 } />
        </FeatureGroup>
        <FeatureGroup>
          <Popup>
            <h1>Current Zone Temp: 34c</h1>
            <h2>It is currently +2c warmer than average.</h2>
            <p>Visits in the last hour: 4</p>
            <p>Average visit length: 1:30</p>
          </Popup>
          <Polygon pathOptions={ warmZone } positions={ greenZone4 } />
        </FeatureGroup>
        <FeatureGroup>
          <Popup>
            <h1>Current Zone Temp: 34c</h1>
            <h2>It is currently +2c warmer than average.</h2>
            <p>Visits in the last hour: 3</p>
            <p>Average visit length: 1:30</p>
          </Popup>
          <Polygon pathOptions={ warmZone } positions={ greenZone5 } />
        </FeatureGroup>
        <LocationLogger />
      </MapContainer>
    </IonContent>
  );
};

export default LeafletContainer;
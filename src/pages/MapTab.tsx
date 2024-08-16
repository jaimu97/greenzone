import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

// Has to be called LeafletContainer and not MapContainer due to a clash in name with the library
import LeafletContainer from '../components/LeafletContainter';

import './MapTab.css';

const MapTab: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Map</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <LeafletContainer />
      </IonContent>
    </IonPage>
  );
};

export default MapTab;

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import HomeContainer from '../../components/tabs/HomeContainer';
import './HomeTab.css';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <HomeContainer/>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

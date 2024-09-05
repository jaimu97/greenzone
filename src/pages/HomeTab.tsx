import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import HomeContainer from '../components/HomeContainer';
import './HomeTab.css';

// Define the props interface for HomeTab. Basically arguments this page needs like calling a function
interface TabProps {
  user: any;
}

/*
 * HomeTab component: Represents the Home page of the app
 * - Uses Ionic components for layout (see the imports on line 1)
 * - Renders the HomeContainer component, passing the user prop
 * - A bit redundant but this is from the tabbed app template, so I've kept the same structure for the most part.
 * - Passes the user prop down to the HomeContainer component
 */
const HomeTab: React.FC<TabProps> = ({ user }) => {
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
        <HomeContainer user={user}/>
      </IonContent>
    </IonPage>
  );
};

export default HomeTab;
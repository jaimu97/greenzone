import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet, IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home,
  locate,
  map,
  personCircleOutline
} from 'ionicons/icons';
import { supabase } from './supabaseClient';

/* TODO: https://ionicframework.com/docs/react/platform
 *   Change what the third tab button does depending on what platform the user is on.
 *   For android, it should show the Journey button and give them the ability to record it.
 *   On desktop, it should show them an overview. Possibly also an admin panel too.
 *   (This change should also replace the icon of the button.)
 */
import JourneyPage from './pages/JourneyPage';
import HomeTab from "./pages/HomeTab";
import MapTab from "./pages/MapTab";
import AccountTab from "./pages/AccountTab"

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import {useEffect, useState} from "react";

setupIonicReact();

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {data: {user}} = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const {data: authListener} = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <IonApp>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
          <IonSpinner/>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tabs/home">
              <HomeTab user={user}/>
            </Route>
            <Route exact path="/tabs/map">
              <MapTab/>
            </Route>
            <Route path="/tabs/journeys">
              <JourneyPage/>
            </Route>
            <Route path="/tabs/account">
              <AccountTab user={user}/>
            </Route>
            <Route exact path="/tabs">
              <Redirect to="/tabs/home"/>
            </Route>
            <Route exact path="/">
              <Redirect to="/tabs/home"/>
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/tabs/home">
              <IonIcon aria-hidden="true" icon={home}/>
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="map" href="/tabs/map">
              <IonIcon aria-hidden="true" icon={map}/>
              <IonLabel>Map</IonLabel>
            </IonTabButton>
            <IonTabButton tab="journeys" href="/tabs/journeys">
              <IonIcon aria-hidden="true" icon={locate}/>
              <IonLabel>Journeys</IonLabel>
            </IonTabButton>
            <IonTabButton tab="account" href="/tabs/account">
              <IonIcon aria-hidden="true" icon={personCircleOutline}/>
              <IonLabel>Account</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

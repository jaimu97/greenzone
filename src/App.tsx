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
import {BackgroundRunner} from "@capacitor/background-runner";

setupIonicReact();

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Effect hook to handle user authentication
   * - Fetches the current user on component load (mount)
   * - Sets up a listener for auth state changes
   * - and then updates the user state and loading state
   */
  useEffect(() => {
    const fetchUser = async () => {
      const {data: {user}} = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    initBackgroundRunner();

    const {data: authListener} = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const initBackgroundRunner = async () => {
    try {
      const permissions = await BackgroundRunner.requestPermissions({
        apis: ['geolocation'],
      });
      console.log('Background runner permissions:', permissions);
    } catch (err) {
      console.error('Failed to initialize background runner:', err);
    }
  };

  // Shows a loading spinner while grabbing user data
  if (loading) {
    return (
      <IonApp>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
          <IonSpinner/>
        </div>
      </IonApp>
    );
  }

  /*
   * Main app structure using Ionic components:
   * - IonReactRouter = routing to other parts ot the app
   * - IonTabs = tab-based navigation
   * - IonTabBar = the bottom tab navigation bar
   * - IonRouterOutlet = rendering different pages based on the current route
   */
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            {/* Define routes for different tabs
              * Also passes the user object to components that need it for authentication
              */}
            <Route exact path="/tabs/home">
              <HomeTab user={user}/>
            </Route>
            <Route exact path="/tabs/map">
              <MapTab/>
            </Route>
            <Route path="/tabs/journeys">
              <JourneyPage user={user}/>
            </Route>
            <Route path="/tabs/account">
              <AccountTab user={user}/>
            </Route>
            {/* Redirect routes if people type forgor or type the url in wrong */}
            <Route exact path="/tabs">
              <Redirect to="/tabs/home"/>
            </Route>
            <Route exact path="/">
              <Redirect to="/tabs/home"/>
            </Route>
          </IonRouterOutlet>
          {/* Bottom tab bar */}
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
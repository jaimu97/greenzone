import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
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

/* TODO: Delete this section once the tabs are re-created */
import Tab3 from './pages/Tab3';
/* END TODO */
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

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/tabs/home">
            <HomeTab />
          </Route>
          <Route exact path="/tabs/map">
            <MapTab />
          </Route>
          <Route path="/tabs/tab3">
            <Tab3 />
          </Route>
          <Route path="/tabs/account">
            <AccountTab />
          </Route>
          <Route exact path="/tabs">
            <Redirect to="/tabs/home" />
          </Route>
          <Route exact path="/">
            <Redirect to="/tabs/home" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/tabs/home">
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="map" href="/tabs/map">
            <IonIcon aria-hidden="true" icon={map} />
            <IonLabel>Map</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tabs/tab3">
            <IonIcon aria-hidden="true" icon={locate} />
            <IonLabel>Tab 3</IonLabel>
          </IonTabButton>
          <IonTabButton tab="account" href="/tabs/account">
            <IonIcon aria-hidden="true" icon={personCircleOutline} />
            <IonLabel>Account</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;

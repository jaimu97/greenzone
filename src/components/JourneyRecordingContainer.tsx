import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonRow,
  IonText,
  IonAlert,
} from '@ionic/react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BackgroundRunner } from '@capacitor/background-runner';
import JourneyMap from './JourneyMap';
import FeedbackCreateModal from "./FeedbackCreateModal";

// props for this component
interface JourneyRecordingProps {
  onEndJourney: () => void; // function is called when the journey ends
  user: any;
}

interface LocationItem {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  };
  time: number;
}

/* BackgroundRunner.dispatchEvent() doesn't have any fucking typescript definitions, so I kept getting
 * TS2339: Property [x] does not exist on type void
 * This is just what gets returned from the background runner defined as an interface:
 * [
 *   {
 *     "location": {
 *       "latitude": [SOMEWHERE...],
 *       "longitude": [SOMEWHERE...],
 *       "accuracy": 26.800001,
 *       "altitude": 27.8787841796875,
 *       "speed": 1.51,
 *       "heading": 204.7
 *     },
 *     "time": 1726189854710
 *   }
 * ]
 */
interface LoadLocationsResult {
  success: boolean;
  locations?: Array<{
    location: {
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude?: number;
      speed?: number;
      heading?: number;
    };
    time: number;
  }>;
  error?: string;
}

// Documentation: https://ionicframework.com/docs/native/geolocation

const JourneyRecordingContainer: React.FC<JourneyRecordingProps> = ({ onEndJourney, user }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [journeyStartTime, setJourneyStartTime] = useState<number | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // feedback modal
  const [journeyId, setJourneyId] = useState<number | null>(null);

  /* This approach to lifecycle management using useEffect is more 'flexible' than the older class-based lifecycle
   * methods I've seen online.
   *
   * It allows the app to group related code together (like setting up and tearing down a subscription) rather than
   * splitting it across different lifecycle methods.
   *
   * Basically, when the component is first rendered (mounted), the code inside the useEffect hook runs.
   *
   * Normally, useEffect would run after every render if the dependency array (the second argument) changes.
   * In this case, we have an empty dependency array [], so the effect only runs once when the component mounts.
   * If we had state variables in the dependency array, the effect would run whenever those variables change, similar to
   * 'componentDidUpdate' (don't use) in class components.
   *
   * Inside the effect, we update various state variables (setCurrentPosition, setPositions, etc.).
   * Each of these state updates will cause the component to re-render, but won't re-run this effect due to the empty
   * dependency array.
   *
   * Then finally the cleanup function basically ensures that we don't continue to watch the user's position after the
   * component is no longer in use, preventing unnecessary background processes.
   *
   * See here: https://react.dev/reference/react/Component
   * "For many use cases, defining componentDidMount, componentDidUpdate, and componentWillUnmount together in class
   * components is equivalent to calling useEffect in function components. In the rare cases where it’s important for
   * the code to run before browser paint, useLayoutEffect is a closer match."
   *
   * OR TL;DR, this useEffect is like a Swiss Army knife for managing when shit happens, it sets things up, keeps an
   * eye on changes, and cleans up after itself when it's done
   */

  // useEffect hook for component lifecycle management, basically function runs after the component is added to the DOM
  useEffect(() => {
  checkPermissions();
  startJourney();
  processBackgroundLocations();
  let watchId: string;

  const startWatching = async () => {
      watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
        if (err) {
          setErrorMessage(`Failed to get location: ${err.message}`);
        } else if (position) {
          setCurrentPosition(position);
          setPositions(prevPositions => [...prevPositions, [position.coords.latitude, position.coords.longitude]]);
          saveJourneyToLocalStorage(position);
        }
      });
    };

    startWatching();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // cleanup function runs when the component will unmount (be removed from the DOM
    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const loadLocations = async (): Promise<LocationItem[]> => {
    try {
      console.log('Attempting to load locations');
      const result = await BackgroundRunner.dispatchEvent({
        label: 'com.greenzone.locationtracking',
        event: 'loadLocations',
        details: {},
      }) as LoadLocationsResult;

      console.log('Load locations result:', result);
      if (result.success && result.locations) {
        console.log('Loaded locations:', result.locations);
        return result.locations;
      } else {
        console.error('Failed to load locations:', result.error);
        return [];
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
      return [];
    }
  };

  const processBackgroundLocations = async () => {
    const backgroundLocations = await loadLocations();
    if (backgroundLocations.length > 0) {
      const newPositions = backgroundLocations.map(item => [
        item.location.latitude,
        item.location.longitude
      ] as [number, number]);

      setPositions(prevPositions => [...prevPositions, ...newPositions]);

      // Save to localtorage
      let journeyData = JSON.parse(localStorage.getItem('currentJourney') || '[]');
      const newJourneyData = backgroundLocations.map(item => ({
        location: `POINT(${item.location.longitude} ${item.location.latitude})`,
        timestamp: item.time,
      }));
      journeyData = [...journeyData, ...newJourneyData];
      localStorage.setItem('currentJourney', JSON.stringify(journeyData));

      // Clear background runner's cache
      await BackgroundRunner.dispatchEvent({
        label: 'com.greenzone.locationtracking',
        event: 'clearLocations',
        details: {},
      });
    }
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      processBackgroundLocations();
    }
  };


  const checkPermissions = async () => {
    const status = await Geolocation.checkPermissions();
    setPermissionStatus(status);
  };

  const startJourney = () => {
    const startTime = Date.now();
    setJourneyStartTime(startTime);

    const newJourneyId = Date.now(); // won't know what the real id is until it's up in supabase.
    setJourneyId(newJourneyId);

    localStorage.setItem('journeyStartTime', startTime.toString());
    localStorage.setItem('currentJourneyId', newJourneyId.toString());
  };

  const saveJourneyToLocalStorage = (position: Position) => {
    let journeyData = JSON.parse(localStorage.getItem('currentJourney') || '[]');
    if (!Array.isArray(journeyData)) {
      journeyData = [];
    }
    journeyData.push({
      location: `POINT(${position.coords.longitude} ${position.coords.latitude})`,
      timestamp: position.timestamp,
    });
    localStorage.setItem('currentJourney', JSON.stringify(journeyData));
  };

  const handleEndJourney = () => {
    if (journeyStartTime && journeyId) {
      const journeyEndTime = Date.now();
      const journeyDuration = journeyEndTime - journeyStartTime;

      const formatWithOffset = (timestamp: number) => {
        /* Definitely not the right way to do this, but needed to 'force' darwin time into the database so when
         * we reconstruct the green zones, it'll always have darwin time.
         *
         * We could also do this in the reconstruction but seems like the better way is to do it here and if there are
         * ever more green zones outside the NT, you can just replace this with a function with an insert of the
         * timezone it was taken in instead.
         *
         * ¯\_(ツ)_/¯
         */
        return new Date(timestamp).toISOString().replace('Z', '+09:30'); // Z = UTC Time (Zulu Time)
      };

      const completeJourney = {
        id: journeyId,
        startTime: formatWithOffset(journeyStartTime),
        endTime: formatWithOffset(journeyEndTime),
        duration: journeyDuration,
        positions: JSON.parse(localStorage.getItem('currentJourney') || '[]').map((pos: any) => ({
          // Positions are stored as 'POINT(lng lat)'
          latitude: parseFloat(pos.location.split(' ')[1].slice(0, -1)), // split after space and remove -1 = ')'
          longitude: parseFloat(pos.location.split(' ')[0].slice(6)), // before space, remove 6 = 'POINT('
          timestamp: pos.timestamp,
        })),
      };

      const allJourneys = JSON.parse(localStorage.getItem('allJourneys') || '[]');
      allJourneys.push(completeJourney);
      localStorage.setItem('allJourneys', JSON.stringify(allJourneys));

      localStorage.removeItem('currentJourney');
      localStorage.removeItem('journeyStartTime');

      onEndJourney();
    }
  };

  return (
    <>
      <IonText>
        <h1>Journey Recording</h1>
      </IonText>
      {errorMessage && (
        <IonAlert
          isOpen={true}
          onDidDismiss={() => setErrorMessage(null)}
          header="Error"
          message={errorMessage}
          buttons={['OK']}
        />
      )}
      {currentPosition && (
        <JourneyMap
          positions={positions}
          centre={[currentPosition.coords.latitude, currentPosition.coords.longitude]}
        />
      )}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Current Location</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText>
            {permissionStatus && (
              <p>Location permission status: {permissionStatus.location}</p>
            )}
            {currentPosition ? (
              <>
                <p>Latitude: {currentPosition.coords.latitude}</p>
                <p>Longitude: {currentPosition.coords.longitude}</p>
                <p>Accuracy: {currentPosition.coords.accuracy} meters</p>
                <p>Timestamp: {new Date(currentPosition.timestamp).toLocaleString()}</p>
              </>
            ) : (
              <p>Waiting for location data...</p>
            )}
          </IonText>
        </IonCardContent>
      </IonCard>
      <IonButton expand="block" color="danger" onClick={handleEndJourney}>
        End Journey
      </IonButton>
      <IonGrid className="ion-padding-top">
        <IonRow>
          <IonCol>
            <IonButton expand="block" color="primary" onClick={() => setIsFeedbackModalOpen(true)}>
              Add feedback
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
      <FeedbackCreateModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        userId={user.id}
        journeyId={journeyId}
      />
    </>
  );
};

export default JourneyRecordingContainer;
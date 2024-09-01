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
import JourneyMap from './JourneyMap';

interface JourneyRecordingProps {
  onEndJourney: () => void;
}

// Documentation: https://ionicframework.com/docs/native/geolocation

const JourneyRecordingContainer: React.FC<JourneyRecordingProps> = ({ onEndJourney }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [journeyStartTime, setJourneyStartTime] = useState<number | null>(null);

  useEffect(() => {
    checkPermissions();
    startJourney();
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

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, []);

  const checkPermissions = async () => {
    const status = await Geolocation.checkPermissions();
    setPermissionStatus(status);
  };

  const startJourney = () => {
    const startTime = Date.now();
    setJourneyStartTime(startTime);
    localStorage.setItem('journeyStartTime', startTime.toString());
  };

  const saveJourneyToLocalStorage = (position: Position) => {
  let journeyData = JSON.parse(localStorage.getItem('currentJourney') || '[]');
  if (!Array.isArray(journeyData)) {
    journeyData = [];
  }
  journeyData.push({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timestamp: position.timestamp,
  });
  localStorage.setItem('currentJourney', JSON.stringify(journeyData));
};

  const handleEndJourney = () => {
    if (journeyStartTime) {
      const journeyEndTime = Date.now();
      const journeyDuration = journeyEndTime - journeyStartTime;

      const formatWithOffset = (timestamp: number) => {
        /* *definitely* not the right way to do this, but needed to 'force' darwin time into the database so when
         * we reconstruct the green zones, it'll always have darwin time. could also do this in the reconstruction
         * but seems like the better way is to do it here and if there are ever more green zones outside the NT,
         * you can just replace this with a function with an insert of the timezone it was taken in instead
         * ¯\_(ツ)_/¯
         */
        return new Date(timestamp).toISOString().replace('Z', '+09:30'); // Z = UTC Time
      };

      const completeJourney = {
        startTime: formatWithOffset(journeyStartTime),
        endTime: formatWithOffset(journeyEndTime),
        duration: journeyDuration,
        positions: JSON.parse(localStorage.getItem('currentJourney') || '[]'),
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
            <IonButton expand="block" color="primary">
              Add feedback
            </IonButton>
          </IonCol>
          <IonCol>
            <IonButton expand="block" color="primary">
              Add image
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default JourneyRecordingContainer;
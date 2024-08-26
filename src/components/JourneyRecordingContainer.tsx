import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonCol,
  IonRow,
  IonAlert,
} from '@ionic/react';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import JourneyMap from './JourneyMap';

interface JourneyRecordingProps {
  onEndJourney: () => void;
}

// Documentation: https://ionicframework.com/docs/native/geolocation

const JourneyRecordingContainer: React.FC<JourneyRecordingProps> = ({ onEndJourney }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);

  useEffect(() => {
    let watchId: string;

    const checkAndRequestPermissions = async () => {
      try {
        const status = await Geolocation.checkPermissions();
        console.log('Initial permission status:', status);
        setPermissionStatus(status);

        if (status.location !== 'granted') {
          const requestStatus = await Geolocation.requestPermissions();
          console.log('Requested permission status:', requestStatus);
          setPermissionStatus(requestStatus);

          if (requestStatus.location !== 'granted') {
            setErrorMessage('Location permission is required to track your journey.');
            return false;
          }
        }
        return true;
      } catch (error) {
        console.error('Error checking permissions:', error);
        setErrorMessage('An error occurred while checking location permissions.');
        return false;
      }
    };

    const startWatchingPosition = async () => {
      const hasPermission = await checkAndRequestPermissions();
      if (hasPermission) {
        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
          (position, err) => {
            if (err) {
              console.error('Error watching position:', err);
              setErrorMessage('Failed to get current location. Please check your device settings.');
              return;
            }
            if (position) {  // Nned if check here or it can return null.
              console.log('New position:', JSON.stringify(position));
              setCurrentPosition(position);
              setPositions(prevPositions => [
                ...prevPositions,
                [position.coords.latitude, position.coords.longitude]
              ]);
            }
          }
        );
      }
    };

    startWatchingPosition();

    return () => {
      if (watchId) Geolocation.clearWatch({ id: watchId });
    };
  }, []);

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
      <IonButton expand="block" color="danger" onClick={onEndJourney}>
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
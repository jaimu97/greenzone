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

interface JourneyRecordingProps {
  onEndJourney: () => void;
}

// Documentation: https://ionicframework.com/docs/native/geolocation

const JourneyRecordingContainer: React.FC<JourneyRecordingProps> = ({ onEndJourney }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

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

    const trackLocation = async () => {
      try {
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        };
      const position = await Geolocation.getCurrentPosition(options);
        console.log('Current position:', JSON.stringify(position));
        setCurrentPosition(position);
        setCountdown(5);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error getting location:', JSON.stringify(error));
        setErrorMessage('Failed to get current location. Please check your device settings.');
      }
    };

    const initializeTracking = async () => {
      const hasPermission = await checkAndRequestPermissions();
      if (hasPermission) {
        await trackLocation();
        /* TODO: Temporary measure to just test if getting the location is possible and we can
         *   update the data live. Might be possible to integrate this into leaflet.
         */
        intervalId = setInterval(() => {
          setCountdown((prevCountdown) => {
            if (prevCountdown === 1) {
              trackLocation();
              return 5;
            }
            return prevCountdown - 1;
          });
        }, 1000);
      }
    };

    initializeTracking();

    return () => {
      if (intervalId) clearInterval(intervalId);
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
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>(Test) Current Location</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText>
            <h2>This is a temporary card, it will be replaced with a leaflet map later.</h2>
            {permissionStatus && (
              <p>Location permission status: {permissionStatus.location}</p>
            )}
            {currentPosition ? (
              <>
                <p>Latitude: {currentPosition.coords.latitude}</p>
                <p>Longitude: {currentPosition.coords.longitude}</p>
                <p>Accuracy: {currentPosition.coords.accuracy} meters</p>
                <p>Timestamp: {new Date(currentPosition.timestamp).toLocaleString()}</p>
                <p>Next update in: {countdown} seconds</p>
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
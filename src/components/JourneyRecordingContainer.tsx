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
} from '@ionic/react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface JourneyRecordingProps {
  onEndJourney: () => void;
}

// Documentation: https://ionicframework.com/docs/native/geolocation

const JourneyRecordingContainer: React.FC<JourneyRecordingProps> = ({ onEndJourney }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const trackLocation = async () => {
      try {
        const position = await Geolocation.getCurrentPosition();
        console.log('Current position:', position);
        setCurrentPosition(position);
        setCountdown(5);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

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

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <IonText>
        <h1>Journey Recording</h1>
      </IonText>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>(Test) Current Location</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText>
            <h2>This is a temporary card, it will be replaced with a map leaflet map later.</h2>
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
            <p>Next update in: {countdown} seconds</p>
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
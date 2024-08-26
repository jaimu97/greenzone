import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonText,
  IonButton,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonRow,
  useIonViewWillEnter,
} from '@ionic/react';
import './JourneyPage.css';
import JourneyRecording from '../components/JourneyRecordingContainer';
import JourneyMap from '../components/JourneyMap';

const JourneyPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [journeyPositions, setJourneyPositions] = useState<[number, number][][]>([]);

  const startJourney = () => {
    setIsRecording(true);
  };

  const endJourney = () => {
    setIsRecording(false);
    // TODO: Save the journey data logic here.
  };

  /* TODO:
   *   This randomly plots point in the green zone areas to show what it should look like.
   *   Will replace this with actual data from the db once I get around to it.
   */
  const generateRandomPositions = (count: number) => {
    // Roughly the bounds of the RDH campus for testing purposes.
    const minLat = -12.358300956831254;
    const maxLat = -12.351121900279576;
    const minLng = 130.87929010391238;
    const maxLng = 130.885705947876;

    return Array.from({ length: count }, () => [
      // Add minimum again, or it'll end up in Papua.
      Math.random() * (maxLat - minLat) + minLat,
      Math.random() * (maxLng - minLng) + minLng,
    ] as [number, number]);
  };

  useIonViewWillEnter(() => {
    // Generate random positions for each journey
    setJourneyPositions([
      generateRandomPositions(4),
      generateRandomPositions(5),
      generateRandomPositions(500),
    ]);
  });
  /* END TODO */

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Journeys</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding">
          {isRecording ? (
            <JourneyRecording onEndJourney={endJourney} />
          ) : (
            <>
              <div className="ion-text-center home-container">
                <IonText className="ion-margin-bottom">
                  <h1 className="bigtext">JOURNEYS</h1>
                </IonText>
                <p>PLACEHOLDER: These cards will be modular and change depending on what device you are viewing this on.</p>
              </div>
              <IonText>
                <h2>Record a Journey</h2>
                <IonButton expand="block" size="large" onClick={startJourney}>Start Journey</IonButton>
                <h2>Previous Journeys</h2>
              </IonText>
              <IonGrid>
                <IonRow>
                  {journeyPositions.map((positions, index) => (
                    <IonCol key={index} size="12" size-md="6">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>Journey {index + 1}</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <JourneyMap positions={positions} />
                          <ul>
                            <li>Location: Sample Location {index + 1}</li>
                            <li>Time: {new Date().toLocaleString()}</li>
                            <li>Temperature: {25 + index * 2}°C</li>
                            <li>Duration: {20 + index * 10} minutes</li>
                          </ul>
                          <IonButton expand="block" fill="solid" color="primary">
                            View Journey
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default JourneyPage;
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
} from '@ionic/react';
import './JourneyPage.css';
import JourneyRecording from '../components/JourneyRecordingContainer';

const JourneyPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  const startJourney = () => {
    setIsRecording(true);
  };

  const endJourney = () => {
    setIsRecording(false);
    // TODO: Save the journey data logic here.
  };

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
                <IonButton onClick={startJourney}>Start Journey</IonButton>
                <h2>Previous Journeys</h2>
              </IonText>
              <IonGrid>
                <IonRow>
                  <IonCol size="12" size-md="6">
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Journey 1</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p>Cards here will be populated automatically once a journey is saved.</p>
                        <p>Information here will include information such as:</p>
                        <ul>
                          <li>Location</li>
                          <li>Time</li>
                          <li>Temperature</li>
                          <li>Duration</li>
                        </ul>
                        <p>Clicking the button below will open a page dedicated to viewing the journey. Including a recreation of the path taken with leaflet.</p>
                        <IonButton expand="block" fill="solid" color="primary">
                          View Journey
                        </IonButton>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                  <IonCol size="12" size-md="6">
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Journey 2</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p>Here is another card example.</p>
                        <IonButton expand="block" fill="solid" color="primary">
                          View Journey
                        </IonButton>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                  <IonCol size="12" size-md="6">
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Journey 3</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p>And another.</p>
                        <IonButton expand="block" fill="solid" color="primary">
                          View Journey
                        </IonButton>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
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

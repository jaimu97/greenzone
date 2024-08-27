import React, { useState, useEffect } from 'react';
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
  IonAlert,
} from '@ionic/react';
import './JourneyPage.css';
import JourneyRecording from '../components/JourneyRecordingContainer';
import JourneyMap from '../components/JourneyMap';

interface JourneyPageProps {
  // TODO: Filter user role and change page to different options. (Admin has all uploaded journeys for example)
  user: any;
}

interface Journey {
  startTime: number;
  endTime: number;
  duration: number;
  positions: { latitude: number; longitude: number; timestamp: number }[];
}

const JourneyPage: React.FC<JourneyPageProps> = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [journeys, setJourneys] = useState<(Journey | null)[]>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [journeyToDelete, setJourneyToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadJourneysFromLocalStorage();
  }, []);

  const loadJourneysFromLocalStorage = () => {
    const storedJourneys = localStorage.getItem('allJourneys');
    if (storedJourneys) {
      const parsedJourneys = JSON.parse(storedJourneys);
      const validatedJourneys = parsedJourneys.map(validateJourney);
      setJourneys(validatedJourneys);
    }
  };

  const validateJourney = (journey: any): Journey | null => {
    if (
      typeof journey.startTime !== 'number' ||
      typeof journey.endTime !== 'number' ||
      typeof journey.duration !== 'number' ||
      !Array.isArray(journey.positions) ||
      journey.positions.length === 0
    ) {
      return null; // fucked journey
    }
    return journey as Journey;
  };

  const startJourney = () => {
    setIsRecording(true);
  };

  const endJourney = () => {
    setIsRecording(false);
    loadJourneysFromLocalStorage();
  };

  const deleteJourney = (index: number) => {
    setJourneyToDelete(index);
    setShowDeleteAlert(true);
  };

  const confirmDeleteJourney = () => {
    if (journeyToDelete !== null) {
      const updatedJourneys = journeys.filter((_, index) => index !== journeyToDelete);
      setJourneys(updatedJourneys);
      localStorage.setItem('allJourneys', JSON.stringify(updatedJourneys.filter(j => j !== null)));
      setShowDeleteAlert(false);
      setJourneyToDelete(null);
    }
  };

  const renderJourneyCards = () => {
    return journeys.map((journey, index) => {
      if (journey === null) {
        return (
          <IonCol key={index} size="12" size-md="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle color="danger">Corrupted Journey</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonButton expand="block" fill="solid" color="danger" onClick={() => deleteJourney(index)}>
                  Delete
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>
        );
      }

      const positions: [number, number][] = journey.positions.map(pos => [pos.latitude, pos.longitude]);
      const durationInMinutes = Math.round(journey.duration / 60000); // milliseconds to minutes

      return (
        <IonCol key={index} size="12" size-md="6">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Journey {index + 1}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <JourneyMap positions={positions} />
              <ul>
                <li>Time: {new Date(journey.startTime).toLocaleString()}</li>
                <li>Duration: {durationInMinutes} minutes</li>
              </ul>
              <IonButton fill="solid" color="danger" onClick={() => deleteJourney(index)}>
                Delete
              </IonButton>
              <IonButton fill="solid" color="primary">
                Upload
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonCol>
      );
    });
  };

  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Journeys</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Not Logged In</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>You are not logged in. Please log in to record journeys.</p>
              </IonText>
              <IonButton routerLink="/tabs/account" expand="block">
                Go to Account
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }


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
              </div>
              <IonText>
                <h2>Record a Journey</h2>
                <IonButton expand="block" size="large" onClick={startJourney}>Start Journey</IonButton>
                <h2>Previous Journeys</h2>
              </IonText>
              <IonGrid>
                <IonRow>
                  {renderJourneyCards()}
                </IonRow>
              </IonGrid>
            </>
          )}
        </div>
      </IonContent>
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Confirm Delete"
        message="Are you sure you want to delete this journey?"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setShowDeleteAlert(false);
              setJourneyToDelete(null);
            },
          },
          {
            text: 'Delete',
            handler: confirmDeleteJourney,
          },
        ]}
      />
    </IonPage>
  );
};

export default JourneyPage;
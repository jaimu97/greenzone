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
  IonSpinner,
} from '@ionic/react';
import './JourneyPage.css';
import JourneyRecording from '../components/JourneyRecordingContainer';
import JourneyMap from '../components/JourneyMap';
import { supabase } from '../supabaseClient'

interface JourneyPageProps {
  // TODO: Filter user role and change page to different options. (Admin has all uploaded journeys for example)
  user: any;
}

/* TODO: Admin page
 *  - Paths people are taking
 *  - See if people have been commenting on plants & who has accessed them.
 *  -
 * TODO: User page
 *  - Heatmap of where users are spending most of their time.
 */


// localstorage journey
interface Journey {
  id?: number; // Not used on local journeys, just need it or get a TS2339 error: `Property 'id' does not exist on type 'Journey'.`
  startTime: number;
  endTime: number;
  duration: number;
  positions: { latitude: number; longitude: number; timestamp: number }[];
}

// supabase journey
interface ServerJourney {
  id: number;
  journey_user: string;
  journey_start: string;
  journey_finish: string;
  locations: { location: string; location_time: string }[];
}

const JourneyPage: React.FC<JourneyPageProps> = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [journeys, setJourneys] = useState<(Journey | null)[]>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [journeyToDelete, setJourneyToDelete] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const [serverJourneys, setServerJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJourneysFromLocalStorage();
    fetchServerJourneys();
  }, [user]);

  const loadJourneysFromLocalStorage = () => {
    const storedJourneys = localStorage.getItem('allJourneys');
    if (storedJourneys) {
      const parsedJourneys = JSON.parse(storedJourneys);
      const validatedJourneys = parsedJourneys.map(validateJourney);
      setJourneys(validatedJourneys);
    }
  };

  const fetchServerJourneys = async () => {
  if (!user) return;

  setIsLoading(true);
  try {
    const { data: journeyData, error: journeyError } = await supabase
      .from('journeys')
      .select('*')
      .eq('journey_user', user.id);

    if (journeyError) throw journeyError;

    const journeysWithLocations = await Promise.all(
      journeyData.map(async (journey) => {
        const { data: locationData, error: locationError } = await supabase
          .from('location')
          .select('location, location_time')
          .eq('journey_id', journey.id);

        if (locationError) throw locationError;

        return {
          ...journey,
          locations: locationData
        };
      })
    );

    const formattedJourneys = journeysWithLocations.map((journey: ServerJourney) => ({
      id: journey.id,
      startTime: new Date(journey.journey_start).getTime(),
      endTime: new Date(journey.journey_finish).getTime(),
      duration: new Date(journey.journey_finish).getTime() - new Date(journey.journey_start).getTime(),
      positions: journey.locations.map(loc => {
        if (typeof loc.location === 'string' && loc.location.includes('(')) {
          const [lon, lat] = loc.location.substring(
            loc.location.indexOf('(') + 1,
            loc.location.indexOf(')')
          ).split(' ');
          return {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            timestamp: new Date(loc.location_time).getTime()
          };
        } else {
          console.error('Unexpected location format:', loc.location);
          return null;
        }
      }).filter(pos => pos !== null)
    }));

    // setServerJourneys(formattedJourneys);
    setServerJourneys(formattedJourneys.filter((journey): journey is Journey => journey !== null));
  } catch (error) {
    console.error('Error fetching journeys:', error);
  } finally {
    setIsLoading(false);
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

  const deleteServerJourney = async (journeyId: number) => {
    try {
      const { error } = await supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId);

      if (error) throw error;

      setServerJourneys(prevJourneys => prevJourneys.filter(journey => journey.id !== journeyId));
    } catch (error) {
      console.error('Error deleting journey:', error);
    }
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

  const uploadJourney = async (journey: Journey, index: number) => {
    if (!user) {
      console.error('User not logged in. This shouldn\'t happen...')
      return;
    }

    /* indexing instead of using blanket 'true' statement to track which journey is being uploaded
     * so that the button state can be set to 'disabled' and prevent users from uploading it more than once.
     */
    setIsUploading(index);

    try {
      console.log('DEBUG: User object:', user);
      console.log('DEBUG: Attempting to insert journey for user:', user.id);
      const { data: journeyData, error: journeyError } = await supabase
        .from('journeys')
        .insert({
          journey_user: user.id,
          journey_start: new Date(journey.startTime).toISOString(),
          journey_finish: new Date(journey.endTime).toISOString()
        })
        .select()
        .single();

      if (journeyError) {
        console.error('DEBUG: Journey insert error:', journeyError);

        throw journeyError;
      }

      console.log('DEBUG: Journey inserted successfully:', journeyData);

      const locationInserts = journey.positions.map(pos => ({
        journey_id: journeyData.id,
        // POINT(lat lng): https://www.crunchydata.com/blog/postgis-and-the-geography-type
        location: `POINT(${pos.longitude} ${pos.latitude})`,
        location_time: new Date(pos.timestamp).toISOString()
      }));

      const { error: locationError } = await supabase
        .from('location')
        .insert(locationInserts);

      if (locationError) throw locationError;

      console.log('Journey uploaded successfully!')

      // remove from local storage:
      const updatedJourneys = journeys.filter((_, i) => i !== index);
      setJourneys(updatedJourneys);
      localStorage.setItem('allJourneys', JSON.stringify(updatedJourneys.filter(j => j !== null)));

      setIsUploading(null);
    } catch (error) {
      console.error('Error uploading journey:', error);
      setIsUploading(null);
    }

  };

  const renderJourneyCards = (journeys: (Journey | null)[], isLocal: boolean) => {
    return journeys.filter((journey): journey is Journey => journey !== null).map((journey, index) => {
      const positions: [number, number][] = journey.positions.map(pos => [pos.latitude, pos.longitude]);
      const durationInMinutes = Math.round(journey.duration / 60000); // milliseconds to minutes

      return (
        <IonCol key={isLocal ? index : journey.id} size="12" size-md="6">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{isLocal ? `Local Journey ${index + 1}` : `Server Journey ${journey.id}`}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <JourneyMap positions={positions} />
              <ul>
                <li>Time: {new Date(journey.startTime).toLocaleString()}</li>
                <li>Duration: {durationInMinutes} minutes</li>
              </ul>
              <IonButton
                fill="solid"
                color="danger"
                onClick={() => isLocal ? deleteJourney(index) : journey.id ? deleteServerJourney(journey.id) : null}
              >
                Delete
              </IonButton>
              {isLocal && (
                <IonButton
                  fill="solid"
                  color="primary"
                  onClick={() => uploadJourney(journey, index)}
                  disabled={isUploading === index}
                >
                  {isUploading === index ? 'Uploading...' : 'Upload'}
                </IonButton>
              )}
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
                  {renderJourneyCards(journeys, true)}
                </IonRow>
              </IonGrid>
              {isLoading ? (
                <IonSpinner />
              ) : (
                <IonGrid>
                  <IonRow>
                    {renderJourneyCards(serverJourneys, false)}
                  </IonRow>
                </IonGrid>
              )}
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
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
    console.log('Current user:', user);
    loadJourneysFromLocalStorage();
    fetchServerJourneys();
    console.log('Loaded journeys:', journeys);
  }, [user]);

  const loadJourneysFromLocalStorage = () => {
    const storedJourneys = localStorage.getItem('allJourneys');
    console.log('Stored journeys:', storedJourneys);
    if (storedJourneys) {
      try {
        const parsedJourneys = JSON.parse(storedJourneys);
        const validatedJourneys = parsedJourneys.map(validateJourney).filter((j: null) => j !== null);
        setJourneys(validatedJourneys);
      } catch (error) {
        console.error('Error parsing stored journeys:', error);
      }
    } else {
      setJourneys([]);
    }
  };

  const fetchServerJourneys = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Fetching journeys for user ID:', user.id);
      const { data: journeyData, error: journeyError } = await supabase
        .from('journeys')
        .select('*')
        .eq('journey_user', user.id);

      if (journeyError) throw journeyError;
      console.log('Fetched journeys:', journeyData);

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
        positions: journey.locations
          .filter(loc => loc && loc.location && true)
          .map(loc => {
            try {
            /* FIXME: To whoever will work on this in the future, we changed the database from PostGIS' 'location' format
             *   to text since we were having trouble with the Well-Known Binary (WKB) format Postgres was returning.
             *   We tried 'common' libraries such as 'simple-features-wkb-js', 'wellknown', 'wkx' and none of them worked
             *   for me for various different reasons.
             *   The uploading section is unchanged so if you ever in the future want to change it back, from this comment
             *   to the 'else' statement is all you *should* need to adapt to make it work.
             *   Good luck. o7
             */
            const [lon, lat] = loc.location.slice(6, -1).split(' ');
              return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                timestamp: new Date(loc.location_time).getTime()
              };
            } catch (error) {
              console.error('Error parsing location:', loc.location, error);
              return null;
            }
          })
          .filter(pos => pos !== null)
      }));

      setServerJourneys(formattedJourneys);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateJourney = (journey: any): Journey | null => {
    if (
      typeof journey.startTime !== 'string' ||
      typeof journey.endTime !== 'string' ||
      typeof journey.duration !== 'number' ||
      !Array.isArray(journey.positions) ||
      journey.positions.length === 0
    ) {
      return null; // fucked journey
    }

    return {
      startTime: new Date(journey.startTime).getTime(),
      endTime: new Date(journey.endTime).getTime(),
      duration: journey.duration,
      positions: journey.positions.map((pos: any) => ({
        latitude: parseFloat(pos.latitude),
        longitude: parseFloat(pos.longitude),
        timestamp: pos.timestamp
      }))
    };
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
      console.log('Attempting to delete journey:', journeyId);
      const { data: deletedJourney, error: journeyError } = await supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId);

      if (journeyError) throw journeyError;
      console.log('Deleted journey:', deletedJourney);

      const { data: deletedLocations, error: locationError } = await supabase
        .from('location')
        .delete()
        .eq('journey_id', journeyId);

      if (locationError) throw locationError;
      console.log('Deleted locations:', deletedLocations);

      setServerJourneys(prevJourneys => prevJourneys.filter(journey => journey.id !== journeyId));

      await fetchServerJourneys();

      console.log('Journey deleted successfully');
    } catch (error) {
      console.error('Error deleting journey:', error);
    }
  };

  const confirmDeleteJourney = async () => {
    if (journeyToDelete !== null) {
      const storedJourneys = JSON.parse(localStorage.getItem('allJourneys') || '[]');
      storedJourneys.splice(journeyToDelete, 1); // unga bunga should remove the journey at the specified index not ALL
      localStorage.setItem('allJourneys', JSON.stringify(storedJourneys));
      setJourneys(storedJourneys);
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
      console.log('User object:', user);
      console.log('Attempting to insert journey for user:', user.id);
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
        console.error('Journey insert error:', journeyError);

        throw journeyError;
      }

      console.log('Journey inserted successfully:', journeyData);

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
      let positions: [number, number][] = [];
      try {
        positions = journey.positions.map(pos => [pos.latitude, pos.longitude]);
      } catch (error) {
        console.error('Error parsing positions:', error);
      }
      const durationInMinutes = Math.round(journey.duration / 60000); // milliseconds to minutes

      const isCorrupted = positions.length === 0;

      return (
        <IonCol key={isLocal ? index : journey.id} size="12" size-md="6">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{isLocal ? `Local Journey ${index + 1}` : `Server Journey ${journey.id}`}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {isCorrupted ? (
                <div>
                  <IonText color="danger">
                    <h2>Corrupted Journey</h2>
                  </IonText>
                </div>
              ) : (
                <>
                  <JourneyMap positions={positions} />
                  <ul>
                    <li>Time: {new Date(journey.startTime).toLocaleString()}</li>
                    <li>Duration: {durationInMinutes} minutes</li>
                  </ul>
                </>
              )}
              <IonButton
                fill="solid"
                color="danger"
                onClick={() => isLocal ? deleteJourney(index) : journey.id ? deleteServerJourney(journey.id) : null}
              >
                Delete
              </IonButton>
              {isLocal && !isCorrupted && (
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
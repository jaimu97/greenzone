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
import KestrelUploadModal from '../components/KestrelUploadModal';
import { supabase } from '../supabaseClient'
import { Buffer } from 'buffer'; // https://www.npmjs.com/package/buffer
import FeedbackViewModal from '../components/FeedbackViewModal';

interface JourneyPageProps {
  user: any;
}

/* These interfaces define the structure of Journey objects. Interfaces are objects but only for type checking and are
 * 'compiled out' from the project when it is rendered. See here for someone not as monkey as me explaining it:
 * https://stackoverflow.com/questions/51716808/when-use-a-interface-or-class-in-typescript
 */
// localstorage journey
interface Journey {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
  positions: { latitude: number; longitude: number; timestamp: number }[];
  isCorrupted?: boolean;
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
  /* State variables using React's useState hook
   * Each const below creates a state variable and its setter function
   */
  const [isRecording, setIsRecording] = useState(false);
  const [journeys, setJourneys] = useState<(Journey)[]>([]); // Array of local journeys
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [journeyToDelete, setJourneyToDelete] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const [serverJourneys, setServerJourneys] = useState<Journey[]>([]); // Array of server journeys
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Modal dialog for the csv kestel uploader
  const [selectedFeedback, setSelectedFeedback] = useState<any[]>([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // modal for feedback (shows text and images)

  function decode(base64String: string): Uint8Array {
    /* Basically takes the base64 and converts it back to an image for supabase, since for *whatever* reason we can't
     * just send the base64 form to the db. -_-
     * A bit annoying since there's only a method for getting it into base64 built in to the capture:
     * resultType: CameraResultType.Base64
     * yet, we need this to get it back to a normal format.
     * https://supabase.com/docs/reference/javascript/storage-from-upload
     */
    return Buffer.from(base64String, 'base64');
  }

  // useEffect hook runs after component mounts or when dependencies change
  useEffect(() => {
    console.log('Current user:', user);
    loadJourneysFromLocalStorage();
    fetchServerJourneys();
    console.log('Loaded journeys:', journeys);
  }, [user]); // This effect runs when the user prop changes

  // Rest of the function names should explain more or less what they do.

  const loadJourneysFromLocalStorage = () => {
    const storedJourneys = localStorage.getItem('allJourneys');
    console.log('Stored journeys:', storedJourneys);
    if (storedJourneys) {
      try {
        const parsedJourneys = JSON.parse(storedJourneys);
        const validatedJourneys = parsedJourneys.map(validateJourney);
        setJourneys(validatedJourneys);
      } catch (error) {
        console.error('Error parsing stored journeys:', error);
      }
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

      const formattedJourneys = journeysWithLocations.map((journey: ServerJourney) => {
        try {
          return {
            id: journey.id,
            startTime: new Date(journey.journey_start).getTime(),
            endTime: new Date(journey.journey_finish).getTime(),
            duration: new Date(journey.journey_finish).getTime() - new Date(journey.journey_start).getTime(),
            positions: journey.locations
              .filter(loc => loc && loc.location && true)
              .map(loc => {
                const [lon, lat] = loc.location.slice(6, -1).split(' ');
                return {
                  latitude: parseFloat(lat),
                  longitude: parseFloat(lon),
                  timestamp: new Date(loc.location_time).getTime()
                };
              })
              .filter(pos => pos !== null)
          };
        } catch (error) {
          console.error('Error parsing journey:', journey, error);
          return {
            id: journey.id,
            startTime: 0,
            endTime: 0,
            duration: 0,
            positions: [],
            isCorrupted: true
          };
        }
      });

      setServerJourneys(formattedJourneys);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateJourney = (journey: any): Journey => {
    if (
      typeof journey.id !== 'number' ||
      typeof journey.startTime !== 'string' ||
      typeof journey.endTime !== 'string' ||
      typeof journey.duration !== 'number' ||
      !Array.isArray(journey.positions) ||
      journey.positions.length === 0
    ) {
      return {
        id: Date.now(), // probably could just make this null.
        startTime: 0,
        endTime: 0,
        duration: 0,
        positions: [],
        isCorrupted: true
      }; // fucked journey
    }

    return {
      id: journey.id,
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
        // POINT(lng lat): https://www.crunchydata.com/blog/postgis-and-the-geography-type
        location: `POINT(${pos.longitude} ${pos.latitude})`,
        location_time: new Date(pos.timestamp).toISOString()
      }));

      const { error: locationError } = await supabase
        .from('location')
        .insert(locationInserts);

      if (locationError) throw locationError;

      console.log('Attempting to insert feedback for journey:', journeyData.id);
      const feedbackData = JSON.parse(localStorage.getItem('journeyFeedback') || '[]');
      const journeyFeedback = feedbackData.filter((fb: any) => fb.journeyId === journey.id);

      if (journeyFeedback.length > 0) {
        for (const fb of journeyFeedback) {
          let mediaUrl = null;

          // upload thge image if it exists
          if (fb.image) {
            /* base64 header basically looks like this: data:image/jpeg;base64,/9j/4AAQS... (and so on)
             * so these consts are basically programmers equivalent of pagan incantations to extract the MIME type to
             * send to supabase for the contentType since phones can capture in more format types than just .png or .jpg
             */
            const imageDataUrl = fb.image;
            const imageData = imageDataUrl.split(',')[1];
            const mimeType = imageDataUrl.substring(imageDataUrl.indexOf(':') + 1, imageDataUrl.indexOf(';'));
            const format = mimeType.split('/')[1];
            const imageName = `${user.id}_${Date.now()}.${format}`;
            const decodedImage = decode(imageData);

            const { data: uploadData, error: uploadError } = await supabase.storage // uploadData not needed.
              .from('feedback-images')
              .upload(imageName, decodedImage, {
                contentType: mimeType
              });

            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              throw uploadError;
            }

            if (!uploadData) {
              console.error('Upload failed: No data returned');
              throw new Error('Upload failed: No data returned');
            }

          console.log('Image uploaded successfully:', uploadData.path);

            const { data: { publicUrl } } = supabase.storage
              .from('feedback-images')
              .getPublicUrl(imageName);

            mediaUrl = publicUrl;
          }

          // insert the feedback
          const { data: feedbackInsert, error: feedbackError } = await supabase
            .from('feedback')
            .insert({
              journey_id: journeyData.id, // need associated journey since it's a FK for this table.
              user_id: user.id,
              content: fb.content,
              created_at: fb.timestamp,
              media_url: mediaUrl
            })
            .select()
            .single();

          if (feedbackError) throw feedbackError;

          // insert media record if image was uploaded
          if (mediaUrl) {
            const { error: mediaError } = await supabase
              .from('media')
              .insert({
                user_id: user.id,
                feedback_id: feedbackInsert.id,
                media_url: mediaUrl,
                created_at: new Date().toISOString(),
                description: 'Feedback image' // Can probably just drop this column in supabase?
              });

            if (mediaError) throw mediaError;
          }
        }

        console.log('Feedback and media uploaded successfully');

        // remove feedback:
        const remainingFeedback = feedbackData.filter((fb: any) => fb.journeyId !== journey.id);
        localStorage.setItem('journeyFeedback', JSON.stringify(remainingFeedback));
      }

      console.log('Journey, images and shit uploaded successfully!');

      // remove from local storage:
      const updatedJourneys = journeys.filter((_, i) => i !== index);
      setJourneys(updatedJourneys);
      localStorage.setItem('allJourneys', JSON.stringify(updatedJourneys.filter(j => j !== null)));

      await fetchServerJourneys();
      setIsUploading(null);
    } catch (error) {
      console.error('Error uploading journey:', error);
      setIsUploading(null);
    }

  };

  const openFeedbackModal = (journeyId: number) => {
    const feedbackData = JSON.parse(localStorage.getItem('journeyFeedback') || '[]');
    const journeyFeedback = feedbackData.filter((fb: any) => fb.journeyId === journeyId);
    setSelectedFeedback(journeyFeedback);
    setIsFeedbackModalOpen(true);
  };

  const renderJourneyCards = (journeys: Journey[], isLocal: boolean) => {
    return journeys.map((journey, index) => {
      if (journey === null) {
        return null; // Skip null journeys since they're corrupted
      }
      let positions: [number, number][] = [];
      if (!journey.isCorrupted) {
        try {
          positions = journey.positions.map(pos => [pos.latitude, pos.longitude]);
        } catch (error) {
          console.error('Error parsing positions:', error);
        }
      }

      const durationInMinutes = Math.round(journey.duration / 60000); // milliseconds to minutes
      const feedbackData = JSON.parse(localStorage.getItem('journeyFeedback') || '[]');
      const hasFeedback = feedbackData.some((fb: any) => fb.journeyId === journey.id);

      return (
        <IonCol key={isLocal ? index : journey.id} size="12" size-md="6">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Journey: {new Date(journey.startTime).toLocaleString()} ({durationInMinutes} Minutes)</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {journey.isCorrupted ? (
                <div>
                  <IonText color="danger">
                    <h2>Corrupted Journey</h2>
                  </IonText>
                </div>
              ) : (
                <>
                  <JourneyMap positions={positions} />
                </>
              )}
               <IonGrid>
                <IonRow>
                  <IonCol size="6">
                    <IonButton
                      expand="block"
                      fill="solid"
                      color="danger"
                      onClick={() => isLocal ? deleteJourney(index) : journey.id ? deleteServerJourney(journey.id) : null}
                    >
                      Delete
                    </IonButton>
                  </IonCol>
                  <IonCol size="6">
                    {isLocal && !journey.isCorrupted && (
                      <IonButton
                        expand="block"
                        fill="solid"
                        color="primary"
                        onClick={() => uploadJourney(journey, index)}
                        disabled={isUploading === index}
                      >
                        {isUploading === index ? 'Uploading...' : 'Upload'}
                      </IonButton>
                    )}
                  </IonCol>
                  {isLocal && hasFeedback && (
                    <IonCol size="6">
                      <IonButton
                        expand="block"
                        fill="solid"
                        color="secondary"
                        onClick={() => openFeedbackModal(journey.id)}
                      >
                        View Feedback
                      </IonButton>
                    </IonCol>
                  )}
                </IonRow>
             </IonGrid>
            </IonCardContent>
          </IonCard>
        </IonCol>
      );
    }).filter(Boolean); // null entries should be removed here
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
            <JourneyRecording onEndJourney={endJourney} user={user}/>
          ) : (
            <>
              <div className="ion-text-center home-container">
                <IonText className="ion-margin-bottom">
                  <h1 className="bigtext">JOURNEYS</h1>
                </IonText>
              </div>
              <IonText>
                <h2>Record a Journey</h2>
              </IonText>
              <IonButton expand="block" size="large" onClick={startJourney}>Start Journey</IonButton>

              <IonText>
                <h2>Upload Kestrel Data</h2>
              </IonText>
              <IonButton expand="block" size="large" onClick={() => setIsUploadModalOpen(true)}>
                Upload Kestrel Data
              </IonButton>

              <IonText>
                <h2>Previous Journeys</h2>
              </IonText>
              <IonGrid>
                <IonRow>
                  {renderJourneyCards(journeys, true)}
                  {isLoading ? (<IonSpinner />) : renderJourneyCards(serverJourneys, false)}
                </IonRow>
              </IonGrid>
            </>
          )}
        </div>
      </IonContent>
      <KestrelUploadModal
        user={user}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
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
      <FeedbackViewModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        feedback={selectedFeedback}
      />
    </IonPage>
  );
};

export default JourneyPage;
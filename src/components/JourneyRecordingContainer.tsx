import React from 'react';
import {
  IonButton,
  IonText,
} from '@ionic/react';

interface JourneyRecordingProps {
  onEndJourney: () => void;
}

const JourneyRecording: React.FC<JourneyRecordingProps> = ({ onEndJourney }) => {
  return (
    <>
      <IonText>
        <h1>Journey Recording</h1>
        <p>This is where the journey recording interface will be implemented.</p>
        <p>Placeholder for GPS tracking, temperature monitoring, and user input fields.</p>
      </IonText>
      <IonButton expand="block" color="danger" onClick={onEndJourney}>
        End Journey
      </IonButton>
    </>
  );
};

export default JourneyRecording;
import React, { useState, useEffect, useRef } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonTextarea,
  IonItem,
  IonLabel,
  IonImg,
  IonToast
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  journeyId: number | null;
}

const FeedbackCreateModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, userId, journeyId }) => {
  const [feedback, setFeedback] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLIonTextareaElement>(null);
  const [showToast, setShowToast] = useState(false); // Feedback from Mark, needs toast to say feedback was recorded.

  useEffect(() => {
    const savedFeedback = localStorage.getItem('tempFeedback');
    if (savedFeedback) {
      setFeedback(savedFeedback);
    }
  }, []);

  // FIXME: Bad hack, stores feedback in localstorage so it doesn't accidentally get removed when the component updates.
  useEffect(() => {
    localStorage.setItem('tempFeedback', feedback);
  }, [feedback]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.value = feedback;
    }
  }, [isOpen, feedback]);

  const handleFeedbackChange = (e: CustomEvent) => {
    setFeedback(e.detail.value!);
  };

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        /* '${}' = template literal
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
         * Basically, here:
         * ${image.format} will be replaced with the image format (e.g., "jpeg" or "png")
         * ${image.base64String} will come into your house and tilt a photo frame by 2 degrees.
         */
        setCapturedImage(`data:image/${image.format};base64,${image.base64String}`);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSubmit = async () => {
    if (feedback.trim()) { // trim removes spaces around text like this: "\n\t Feed, back. " becomes "Feed, back."
      const feedbackData = {
        content: feedback,
        timestamp: new Date().toISOString(),
        image: capturedImage,
        userId: userId,
        journeyId: journeyId
      };

      // saving it to localstorage and sending it to supabase later.
      const existingFeedback = JSON.parse(localStorage.getItem('journeyFeedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('journeyFeedback', JSON.stringify(existingFeedback));

      console.log('Feedback stored locally:', feedbackData);
      setShowToast(true);
      /* FIXME: Delays modal closing by 1.5 seconds to display this toast. Should be showing the toast in the parent
       *   `JourneyRecordingContainer.tsx`. Will do once testing is complete, needed this implemented ASAP.
       */
      setTimeout(() => {
        clearFeedbackAndClose();
      }, 1500);
    }
  };

  const clearFeedbackAndClose = () => {
    setFeedback('');
    setCapturedImage(null);
    localStorage.removeItem('tempFeedback');
    onClose();
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={clearFeedbackAndClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Add Feedback</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* FIXME: Modal will delete any text if the textbox scrolls off the screen.
          *   useEffect is the solution I can think of, however, I had some problems with it 'glitching' and overwriting
          *   text that had been entered due to it not updating every time a letter is added.
          */}
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Your Feedback</IonLabel>
            <IonTextarea
              ref={textareaRef}
              onIonInput={handleFeedbackChange}
              placeholder="Enter your feedback here..."
              rows={6}
            />
          </IonItem>
          {capturedImage && (
            <IonImg src={capturedImage} className="ion-margin-top" />
          )}
          <IonButton expand="block" onClick={takePhoto} className="ion-margin-top">
            Take Photo
          </IonButton>
          <IonButton expand="block" onClick={handleSubmit} className="ion-margin-top">
            Submit Feedback
          </IonButton>
          <IonButton expand="block" onClick={clearFeedbackAndClose} color="light" className="ion-margin-top">
            Cancel
          </IonButton>
        </IonContent>
      </IonModal>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Feedback recorded!"
        duration={1500}
        position="bottom"
      />
    </>
  );
};

export default FeedbackCreateModal;
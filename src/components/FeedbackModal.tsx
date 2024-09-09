import React, { useState } from 'react';
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
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, userId }) => {
  const [feedback, setFeedback] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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
        userId: userId
      };

      // saving it to localstorage and sending it to supabase later.
      const existingFeedback = JSON.parse(localStorage.getItem('journeyFeedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('journeyFeedback', JSON.stringify(existingFeedback));

      console.log('Feedback stored locally:', feedbackData);
      setFeedback('');
      setCapturedImage(null);
      onClose();
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Feedback</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Your Feedback</IonLabel>
          <IonTextarea
            value={feedback}
            onIonChange={e => setFeedback(e.detail.value!)}
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
        <IonButton expand="block" onClick={onClose} color="light" className="ion-margin-top">
          Cancel
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default FeedbackModal;
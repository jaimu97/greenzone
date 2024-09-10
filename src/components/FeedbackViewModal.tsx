import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonImg,
} from '@ionic/react';

interface FeedbackViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: any[];
}

const FeedbackViewModal: React.FC<FeedbackViewModalProps> = ({ isOpen, onClose, feedback }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Journey Feedback</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {feedback.map((item, index) => (
          <IonCard key={index}>
            <IonCardHeader>
              <IonCardTitle>Feedback {index + 1}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{item.content}</p>
              {item.image && (
                <IonImg src={item.image} alt="Feedback Image" />
              )}
              <p>Timestamp: {new Date(item.timestamp).toLocaleString()}</p>
            </IonCardContent>
          </IonCard>
        ))}
        <IonButton expand="block" onClick={onClose}>Close</IonButton>
      </IonContent>
    </IonModal>
  );
};

export default FeedbackViewModal;
import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonText,
  IonButton, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonRow,
} from '@ionic/react';
import './Tab3.css';

const Tab3: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Journeys</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-text-center home-container">
          <IonText className="ion-margin-bottom">
            <h1 className="bigtext">JOURNEYS</h1>
          </IonText>
          <p>PLACEHOLDER: These cards will be modular and change depending on what device you are viewing this on.</p>
        </div>
        <IonText>
          <h2>Record a Journey</h2>
          <IonButton>Start Journey</IonButton>
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
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
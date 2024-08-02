import './HomeContainer.css';
import {IonButton, IonText} from "@ionic/react";
import React from "react";


const HomeContainer: React.FC = () => {
  return (
    <>
      <div className="ion-text-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">GREEN ZONE</h1>
        </IonText>
      </div>
      <div className="ion-text-center ion-margin-top button-container">
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">MAP</IonButton>
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">ZONE</IonButton>
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">FEEDBACK</IonButton>
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">PLANTS</IonButton>
      </div>
    </>
  );
};

export default HomeContainer;

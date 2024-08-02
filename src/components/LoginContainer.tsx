import React, {useState} from 'react';
import {IonList, IonItem, IonInput, IonButton, IonText} from '@ionic/react';
import './LoginContainer.css';

/*
  Sources:
  https://legacy.reactjs.org/docs/hooks-state.html
  https://ionicframework.com/docs/react/navigation#ionpage
  https://ionicframework.com/docs/api/title#headings
  https://ionicframework.com/docs/api/input
  https://ionicframework.com/docs/api/button
  https://ionicframework.com/docs/api/text
  https://ionicframework.com/docs/layout/css-utilities#flex-container-properties // FIXME: 'ion-align-items-center' doesn't seem to work.

*/

const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Just stops form from being cleared when bad information is entered
    console.log('Form submitted:', { email, password });
    // TODO: Figure out how to *actually* do forms in react. Pretty sure you can't just write them as html forms.
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ion-text-center ion-align-items-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">Green Zone</h1>
        </IonText>
      </div>
      <IonList>
        <IonItem>
          <IonInput
            label="Email"
            placeholder=""
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Password"
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
      </IonList>
      <div className="ion-text-center ion-margin-top">
        <IonButton type="submit" className="ion-margin-end">Login</IonButton>
        <IonButton type="button">Sign Up</IonButton>
      </div>
    </form>
  );
};

export default LoginContainer;

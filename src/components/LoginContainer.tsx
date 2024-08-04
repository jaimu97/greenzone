import React, {useState} from 'react';
import {IonList, IonItem, IonInput, IonButton, IonText} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './LoginContainer.css';

const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Just stops form from being cleared when bad information is entered
    console.log('Form submitted:', { email, password });
    // TODO: Figure out how to *actually* do forms in react. Pretty sure you can't just write them as html forms.
  };

  const handleSignUpClick = () => {
    history.push('/signup');
  };

  const handleLoginClick = () => {
    history.push('tabs/home'); // TODO: Needs login. Accepts anything, just takes you to the demo page.
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ion-text-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">GREEN ZONE</h1>
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
        <IonButton type="button" color="secondary" className="ion-margin-end" onClick={handleSignUpClick}>Sign Up</IonButton>
        <IonButton type="submit" color="primary" onClick={handleLoginClick}>Login</IonButton>
      </div>
    </form>
  );
};

export default LoginContainer;

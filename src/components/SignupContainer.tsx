import React, {useState} from 'react';
import {IonList, IonItem, IonInput, IonButton, IonText, IonToast} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './LoginContainer.css';

const SignupContainer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verify, setVerify] = useState('');
  const history = useHistory();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Just stops form from being cleared when bad information is entered
    console.log('Form submitted:', { email, password, verify });
    // TODO: Figure out how to *actually* do forms in react. Pretty sure you can't just write them as html forms.
  };

  const handleLoginClick = () => {
    history.push('/login'); // TODO: Needs login. Accepts anything, just takes you to the demo page.
  };

  const handleCreationClick = () => {
    history.push('/login');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ion-text-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">CREATE AN ACCOUNT</h1>
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
        <IonItem>
          <IonInput
            label="Confirm Password"
            type="password"
            value={verify}
            onIonChange={(e) => setVerify(e.detail.value!)}
          />
        </IonItem>
      </IonList>
      <div className="ion-text-center ion-margin-top">
        <IonButton type="button" color="secondary" className="ion-margin-end" onClick={handleLoginClick}>Login</IonButton>
        <IonButton id="open-toast" type="submit" color="primary" onClick={handleCreationClick}>Create Account</IonButton>
        <IonToast trigger="open-toast" message="Account created! Please login." duration={5000}></IonToast>
      </div>
    </form>
  );
};


export default SignupContainer;

import React, { useState } from 'react';
import {
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonToast,
  IonLoading,
  IonIcon
} from '@ionic/react';
import { lockClosedOutline, personOutline } from "ionicons/icons";
import { supabase } from '../../supabaseClient';
import { useHistory } from 'react-router-dom';
import './LoginContainer.css';

const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | undefined>(undefined); // True = string or False = undefined
  const history = useHistory();

  const handleLoginClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Just stops form from being cleared when bad information is entered
    setShowLoading(true); // For slow internet users, show them something to let them know their account has been sent.

    if (!email || !password) {
      setShowToast('Please enter both email and password');
      setShowLoading(false);
      return;
    }

    // Attempt to sign in user with Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setShowToast(error.message);
      } else if (data?.user) {
        // Redirect to /tabs/home based on feedback from Cat/Mark
        history.push('/tabs/home');
      } else {
        setShowToast('Oops! Something went wrong. Check the console.');
        console.error('Unexpected response:', data);
      }
    } catch (err) {
      setShowToast('I dunno, chief. Better check the console.');
      console.error('Something else went wrong: ', err);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <form onSubmit={handleLoginClick}>
      <div className="ion-text-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">WELCOME BACK</h1>
        </IonText>
      </div>
      <IonList inset={true}>
        <IonItem>
          <IonIcon icon={personOutline} slot="start" />
          <IonInput
            label="Email"
            placeholder=""
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonIcon icon={lockClosedOutline} slot="start" />
          <IonInput
            label="Password"
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value || '')}
          />
        </IonItem>
      </IonList>
      <div className="ion-text-center ion-margin-top">
        <IonButton type="submit" color="primary">Login</IonButton>
      </div>
      <IonLoading isOpen={showLoading} message="Logging in..." />
      <IonToast
        isOpen={!!showToast}
        message={showToast}
        duration={3000}
        onDidDismiss={() => setShowToast(undefined)}
      />
    </form>
  );
};

export default LoginContainer;

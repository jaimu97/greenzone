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
import { lockClosedOutline, personOutline } from 'ionicons/icons';
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

    // Re-check the values right before validation, should fix the "Please enter x" message when forms are filled.
    const currentEmail = email.trim();
    const currentPassword = password.trim();

    if (!currentEmail || !currentPassword) {
      setShowToast('Please enter both email and password');
      return;
    }

    setShowLoading(true); // For slow internet users, show them something to let them know their account has been sent.

    // Attempt to sign in user with Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: currentEmail, password: currentPassword });

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
            type="email"
            placeholder="test@test.com"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            required
          />
        </IonItem>
        <IonItem>
          <IonIcon icon={lockClosedOutline} slot="start" />
          <IonInput
            label="Password"
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            required
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

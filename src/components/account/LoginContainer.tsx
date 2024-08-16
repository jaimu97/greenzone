import React, { useState } from 'react';
import {
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonToast,
  IonLoading
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './LoginContainer.css';

const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | undefined>(undefined); // True = string or False = undefined
  const history = useHistory();

  const handleLoginClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Just stops form from being cleared when bad information is entered
    setShowLoading(true); // For show internet users, show them something to let them know their account has been sent.

    if (!email || !password) {
    setShowToast('Please enter both email and password');
    setShowLoading(false);
    return;
    }

    console.log('Attempting login with:', { email, password });

    try { // FIXME: FUcking supabase not accepting the account.
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Supabase response:', { data, error });

      if (error) {
        setShowToast(error.message);
        console.error('Login error :( ', error);
      } else if (data?.user) {
        console.log('Login successful :) ', data.user);
        history.push('/tabs/home');
      } else {
        setShowToast('Oops! Something went wrong. Check the console.'); // Like every modern app with unhelpful errors, fuck u. :)
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
            onIonChange={(e) => {
              console.log('Password input changed:', e.detail.value);
              /* trying to use an empty string to see if e.detail.value is null or undefined.
               * previously it was printing in the browser console this:
               * "Attempting login with: {email: 'test@test.com', password: ''}"
               * regardless of if this field had data in it and since java/typescript is fucking
               * horrific I'm not sure if it's casting a null or undefined value to '' silently or not.
               */
              setPassword(e.detail.value || ''); // Works, so it was...?
            }}
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

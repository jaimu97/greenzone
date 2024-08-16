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

const SignupContainer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verify, setVerify] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | undefined>(undefined);
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Just stops form from being cleared when bad information is entered
    if (password !== verify) {
      setShowToast('Passwords do not match');
      return;
    }

    setShowLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setShowLoading(false);

    if (error) {
      setShowToast(error.message);
    } else {
      history.push('/account');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ion-text-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">CREATE AN ACCOUNT</h1>
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
        <IonButton type="submit" color="primary">Create Account</IonButton>
      </div>
      <IonLoading isOpen={showLoading} message="Creating account..." />
      <IonToast
       isOpen={!!showToast}
       message={showToast}
       duration={3000}
       onDidDismiss={() => setShowToast(undefined)}
     />
    </form>
  );
};


export default SignupContainer;

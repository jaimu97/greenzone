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
import { useHistory } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './LoginContainer.css';
import {lockClosedOutline, mailOutline, peopleOutline, personOutline} from "ionicons/icons";

const SignupContainer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verify, setVerify] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | undefined>(undefined);
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== verify) {
      setShowToast('Passwords do not match');
      return;
    }

    setShowLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          surname,
        }
      }
    });

    if (error) {
      setShowLoading(false);
      setShowToast(error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          first_name: firstName,
          surname,
        });

      if (profileError) {
        setShowLoading(false);
        setShowToast(profileError.message);
        return;
      }
    }

    setShowLoading(false);
    history.push('/tabs/home');
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
              <IonIcon icon={mailOutline} slot="start" />
              <IonInput
                label="Email"
                placeholder=""
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={personOutline} slot="start" />
              <IonInput
                label="Username"
                placeholder=""
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={peopleOutline} slot="start" />
              <IonInput
                label="First Name"
                placeholder=""
                value={firstName}
                onIonChange={(e) => setFirstName(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={peopleOutline} slot="start" />
              <IonInput
                label="Surname"
                placeholder=""
                value={surname}
                onIonChange={(e) => setSurname(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                label="Password"
                type="password"
                placeholder=""
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                label="Confirm Password"
                type="password"
                placeholder=""
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

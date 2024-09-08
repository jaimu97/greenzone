import React, { useState, useEffect } from 'react';
import {
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonToast,
  IonLoading,
  IonIcon,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { lockClosedOutline, peopleOutline, personOutline } from "ionicons/icons";
import { supabase } from '../../supabaseClient';
import './LoginContainer.css';

interface EditProfileContainerProps {
  user: any;
  onProfileUpdated: () => void; // Callback to notify parent when profile is updated
}

const EditProfileContainer: React.FC<EditProfileContainerProps> = ({ user, onProfileUpdated }) => {
  const [password, setPassword] = useState('');
  const [verify, setVerify] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [typeOfUser, setTypeOfUser] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          setProfile(data);
          // Pre-fill form fields with fetched profile data
          setUsername(data.username);
          setFirstName(data.first_name);
          setSurname(data.surname);
          setTypeOfUser(data.User_Type);
          // You can add more fields here as necessary
        } catch (error) {
          console.error('Error fetching profile: ', error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== verify) {
      setShowToast('Passwords do not match');
      return;
    }

    setShowLoading(true);

    try {
      const fullname = `${firstName} ${surname}`;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username,
          first_name: firstName,
          surname,
          full_name: fullname,
          User_Type: typeOfUser
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setShowToast('Profile updated successfully!');
      onProfileUpdated(); // Notify parent component that profile was updated
    } catch (error: any) {
      setShowToast(error.message);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ion-text-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">EDIT PROFILE</h1>
        </IonText>
      </div>
      <IonList inset={true}>
        <IonItem>
          <IonIcon icon={personOutline} slot="start" />
          <IonInput
            label="Username"
            placeholder="Enter username"
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonIcon icon={peopleOutline} slot="start" />
          <IonInput
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onIonChange={(e) => setFirstName(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonIcon icon={peopleOutline} slot="start" />
          <IonInput
            label="Surname"
            placeholder="Enter surname"
            value={surname}
            onIonChange={(e) => setSurname(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonIcon icon={peopleOutline} slot="start" />
          <IonSelect
            label="Type of User"
            placeholder="Select"
            value={typeOfUser}
            onIonChange={(e) => setTypeOfUser(e.detail.value!)}
          >
            <IonSelectOption value="Patient">Patient</IonSelectOption>
            <IonSelectOption value="Staff">Staff</IonSelectOption>
            <IonSelectOption value="Visitor">Visitor</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonIcon icon={lockClosedOutline} slot="start" />
          <IonInput
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonIcon icon={lockClosedOutline} slot="start" />
          <IonInput
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={verify}
            onIonChange={(e) => setVerify(e.detail.value!)}
          />
        </IonItem>
      </IonList>
      <div className="ion-text-center ion-margin-top">
        <IonButton type="submit" color="primary">Update Profile</IonButton>
      </div>
      <IonLoading isOpen={showLoading} message="Updating profile..." />
      <IonToast
        isOpen={!!showToast}
        message={showToast}
        duration={3000}
        onDidDismiss={() => setShowToast(undefined)}
      />
    </form>
  );
};

export default EditProfileContainer;

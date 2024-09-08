import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
} from '@ionic/react';
import { supabase } from '../supabaseClient';
import LoginContainer from '../components/account/LoginContainer';
import SignupContainer from '../components/account/SignupContainer';
import EditProfileContainer from '../components/account/EditProfileContainer';

interface TabProps {
  user: any;
}

const AccountTab: React.FC<TabProps> = ({ user }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
        } catch (error) {
          console.error('Error fetching profile: ', error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleLoginSignup = () => {
    setShowLogin(!showLogin);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleProfileUpdated = () => {
    // This function is called after profile update
    setIsEditing(false); // Switch back to account view
    setLoading(true); // Show loading while re-fetching profile
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  };

  if (loading) {
    return <IonSpinner />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user ? (
          isEditing ? (
            <EditProfileContainer user={user} onProfileUpdated={handleProfileUpdated} />
          ) : (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>User Profile</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>
                      <h2>ID</h2>
                      <p>{user.id}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>Email</h2>
                      <p>{user.email}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>Username</h2>
                      <p>{profile?.username || 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>First Name</h2>
                      <p>{profile?.first_name || 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>Surname</h2>
                      <p>{profile?.surname || 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>User Type</h2>
                      <p>{profile?.User_Type || 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>Last Sign In</h2>
                      <p>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>Created At</h2>
                      <p>{user.created_at ? formatDate(user.created_at) : 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h2>Phone</h2>
                      <p>{user.phone || 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                </IonList>
                <IonButton expand="block" onClick={() => setIsEditing(true)} className="ion-margin-top">
                  Edit Profile
                </IonButton>
                <IonButton expand="block" onClick={handleLogout} className="ion-margin-top">
                  Logout
                </IonButton>
              </IonCardContent>
            </IonCard>
          )
        ) : (
          <>
            {showLogin ? <LoginContainer /> : <SignupContainer />}
            <IonButton type="button" expand="block" fill="clear" onClick={toggleLoginSignup}>
              {showLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AccountTab;

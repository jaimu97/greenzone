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
} from '@ionic/react';
import { supabase } from '../supabaseClient';
import LoginContainer from '../components/account/LoginContainer';
import SignupContainer from '../components/account/SignupContainer';

const AccountTab: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile: ', error);
        } else {
          setProfile(data);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching profile: ', error);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleLoginSignup = () => {
    setShowLogin(!showLogin);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(); // Database returns date data as ISO 8601 time, need to format it properly.
  };

  /* FIXME: I don't know what the fuck is happening but sometimes when I make changes, the profile data cache gets
   *   all messed up and shows either just the username or a spinner (on the home page) so I'm hoping just wiping
   *   everything will fix this.
   */
  const handleReset = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setShowLogin(true);
    window.location.reload();
  };

  /* TODO: Replace this account data with a page that lets you edit the information and set things like a user icon?
       Right now, I am just using some of the output fields you get when you run 'select * from auth.users' in
       the supabase SQL Editor panel.
   */
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>User Profile (Placeholder)</IonCardTitle>
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
                    <h2>Role</h2>
                    <p>{user.role || 'N/A'}</p>
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
              <IonButton expand="block" onClick={handleLogout} className="ion-margin-top">Logout</IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            {showLogin ? <LoginContainer /> : <SignupContainer />}
            <IonButton type="button" expand="block" fill="clear" onClick={toggleLoginSignup}>
              {showLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </IonButton>
          </>
        )}
        <br/>
        <div className="ion-text-center ion-margin-top">
          <h1><strong>Debug:</strong> Clears <em>everything</em>. Should fix account information not loading.</h1>
          <IonButton
              expand="block"
              color="danger"
              onClick={handleReset}
              className="ion-margin"
              style={{ fontSize: '5em', fontWeight: 'bold' }}>
            UN-FUCK APP
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccountTab;
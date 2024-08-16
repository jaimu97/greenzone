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
  IonCardTitle
} from '@ionic/react';
import { supabase } from '../supabaseClient';
import LoginContainer from '../components/account/LoginContainer';
import SignupContainer from '../components/account/SignupContainer';

const AccountTab: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
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
    return new Date(dateString).toLocaleString(); // Stupid "hack", database was returning data as unix time.
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
      </IonContent>
    </IonPage>
  );
};

export default AccountTab;
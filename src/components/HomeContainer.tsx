import './HomeContainer.css';
import {
  IonButton,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';

const HomeContainer: React.FC = () => {
  const [userData, setUserData] = useState<{user: any, profile: any} | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile: ', error);
      return null;
    }
    return profile;
  };

  const updateUserData = async (currentUser: any) => {
    if (currentUser) {
      const profile = await fetchUserData(currentUser.id);
      setUserData({ user: currentUser, profile });
    } else {
      setUserData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await updateUserData(user);
    };

    checkUser().then(r => {}); // .then is just to stop checkers annoying about promises unused.

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      await updateUserData(currentUser ?? null); // If you ever see 'null' pls let me know. - Jai
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <IonSpinner />;
  }

  return (
    <>
      <div className="ion-text-center home-container">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">GREEN ZONE</h1>
        </IonText>
        {userData ? (
          <IonText>
            <h2>Hello, {userData.profile?.first_name || userData.user.email}</h2>
          </IonText>
        ) : (
          <IonText>
            <h2>Welcome, Guest</h2>
          </IonText>
        )}
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonCard className="feedback-card">
                <img src="../../img/IMG_20160809_164508.jpg" alt="Feedback" />
                <IonCardHeader>
                  <IonCardTitle>Share Your Journey</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Help researchers and record a journey through a green zone.</p>
                  <IonButton expand="block" fill="solid" color="primary">
                    Start Journey
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" size-md="6">
              <IonCard className="welcome-card">
                <img src="../../img/PXL_20240806_084907679.jpg" alt="Green Zone" />
                <IonCardHeader>
                  <IonCardTitle>Discover Green Zones</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Explore active green zones near you and learn about the native flora.</p>
                  <IonButton expand="block" fill="solid" color="primary" href="/tabs/map">
                    Explore Now
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
    </>
  );
};

export default HomeContainer;

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
  IonCol
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';

const HomeContainer: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data, error } = await supabase
          /* Feels "incorrect" to make a "SQL query" like this on the site but going off supabase's own documentation,
           * it says to do this:
           * https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-react#account-page
           */
          .from('profiles')
          .select('first_name')
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

    // FIXME: De-duplicate this code? A lot is repeated in the block above and in AccountTab.tsx
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching profile: ', error);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null); // If you ever see 'null' pls let me know. - Jai
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <div className="ion-text-center home-container">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">GREEN ZONE</h1>
        </IonText>
        {user ? (
          <IonText>
            <h2>Hello, {profile?.first_name || user.email}</h2>
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
                  <IonButton expand="block" fill="solid" color="primary" className="explore-button">
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
                  <IonButton expand="block" fill="solid" color="primary" className="explore-button" href="/tabs/map">
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

import './HomeContainer.css';
import { IonButton, IonText } from "@ionic/react";
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
      <div className="ion-text-center">
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
      </div>
      <div className="ion-text-center ion-margin-top button-container">
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">MAP</IonButton><br/>
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">ZONE</IonButton><br/>
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">FEEDBACK</IonButton><br/>
        <IonButton className="ion-margin-bottom" type="button" color="primary" size="large">PLANTS</IonButton><br/>
      </div>
    </>
  );
};

export default HomeContainer;

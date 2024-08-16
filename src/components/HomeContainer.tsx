import './HomeContainer.css';
import { IonButton, IonText, IonLoading } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';

const HomeContainer: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <IonLoading isOpen={true} message="Loading..." />;
  }

  return (
    <>
      <div className="ion-text-center">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">GREEN ZONE</h1>
        </IonText>
        {user ? (
          <IonText>
            <h2>Hello, {user.email}</h2>
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

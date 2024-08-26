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

interface HomeContainerProps {
  user: any;
}

const HomeContainer: React.FC<HomeContainerProps> = ({ user }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name')
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

  const renderWelcomeMessage = () => {
    if (loading) {
      return <IonSpinner />;
    }
    if (user && profile) {
      return <h2>Hello, {profile.first_name || user.email}</h2>;
    }
    return <h2>Welcome, Guest</h2>;
  };

  return (
    <>
      <div className="ion-text-center home-container">
        <IonText className="ion-margin-bottom">
          <h1 className="bigtext">GREEN ZONE</h1>
        </IonText>
        <IonText>
          {renderWelcomeMessage()}
        </IonText>
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonCard className="feedback-card">
                <img src="../../img/IMG_20160809_164508.jpg" alt="Feedback"/>
                <IonCardHeader>
                  <IonCardTitle>Share Your Journey</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Help researchers and record a journey through a green zone.</p>
                  <IonButton expand="block" fill="solid" color="primary" href="/tabs/journeys">
                    Start Journey
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" size-md="6">
              <IonCard className="welcome-card">
                <img src="../../img/PXL_20240806_084907679.jpg" alt="Green Zone"/>
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

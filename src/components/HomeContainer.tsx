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

/* HomeContainer component: Main content for the Home page
 * - Fetches and displays user profile information
 * - Renders welcome message and action cards
 */

const HomeContainer: React.FC<HomeContainerProps> = ({ user }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from Supabase
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
              <IonCard className="green-zone-explanation-card">
                <IonCardHeader>
                  <img
                    src="https://supabase.epicminecraft.xyz/storage/v1/object/public/static-images/20CAB3D8-7BFB-4656-82A2-243C0CD85D34_1_105_c.jpeg"
                    alt="Green Zone Illustration"/>
                  <IonCardTitle>What is a Green Zone?</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    <em>(This is placeholder text for the most part.)</em>
                  </p>
                  <p>
                    <strong>Green Zones</strong> are specially designed outdoor areas within the Royal Darwin Hospital
                    that showcase native plants significant to the Larrakia people. These zones provide restorative and
                    climate-resilient spaces, promote cultural connection, and support biodiversity.
                  </p>
                  <p>
                    The gardens feature traditional Larrakia plants and bush tucker, emphasising their medicinal,
                    culinary, and practical applications. Exploring these areas allows you to engage with the
                    environment, learn about native flora, and understand their importance in First Nation culture.
                  </p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" size-md="6">
              <IonCard className="welcome-card">
                <img
                  src="https://supabase.epicminecraft.xyz/storage/v1/object/public/static-images/PXL_20240806_084907679.jpg"
                  alt="Explore Green Zones"/>
                <IonCardHeader>
                <IonCardTitle>Discover Green Zones</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Explore active Green Zones near you and learn about the native flora. Dive into the rich cultural
                    heritage and natural beauty these zones offer.</p>
                  <IonButton expand="block" fill="solid" color="primary" href="/tabs/map">
                    Explore Now
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" size-md="6">
              <IonCard className="feedback-card">
                <img
                  src="https://supabase.epicminecraft.xyz/storage/v1/object/public/static-images/IMG_20160809_164508.jpg"
                  alt="Start Journey"/>
                <IonCardHeader>
                  <IonCardTitle>Share Your Journey</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Help researchers by recording your journey through a Green Zone. Your participation contributes to
                    valuable insights and improvements in First Nations healthcare.</p>
                  <IonButton expand="block" fill="solid" color="primary" href="/tabs/journeys">
                    Start Journey
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

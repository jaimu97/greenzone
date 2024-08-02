import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './LoginPage.css';
import LoginContainer from "../components/LoginContainer";

const LoginPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
        </IonHeader>
        <LoginContainer/>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
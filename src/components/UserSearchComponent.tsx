import React, { useState } from 'react';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonListHeader,
} from '@ionic/react';
import { supabase } from '../supabaseClient';

interface UserSearchProps {
  onUserSelect: (user: any) => void;
}

const UserSearchComponent: React.FC<UserSearchProps> = ({ onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingUsers, setMatchingUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(
          /* TODO: Should also include email but that's part of auth.users not profiles.
           * https://supabase.com/docs/reference/javascript/ilike https://www.geeksforgeeks.org/postgresql-ilike-operator/
           * `ilike` is case-insensitive search.
           */
          `first_name.ilike.%${searchQuery}%,surname.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`
        );

      if (error) throw error;

      setMatchingUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: any) => {
    onUserSelect(user);
    setMatchingUsers([]);
    setSearchQuery('');
  };

  return (
    <>
      <IonItem>
        <IonInput
          value={searchQuery}
          placeholder="Enter a first name, surname or username."
          onIonChange={(e) => setSearchQuery(e.detail.value!)}
        />
      </IonItem>
      <IonButton expand="block" onClick={handleSearch} disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Search'}
      </IonButton>
      {matchingUsers.length > 0 && (
        <>
          <IonListHeader>
            <IonLabel>Matching Users</IonLabel>
          </IonListHeader>
          <IonList>
            {matchingUsers.map((user) => (
              <IonItem
                key={user.id}
                button
                onClick={() => handleUserSelect(user)}
              >
                <IonLabel>
                  {user.first_name} {user.surname} ({user.username})
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </>
      )}
    </>
  );
};

export default UserSearchComponent;
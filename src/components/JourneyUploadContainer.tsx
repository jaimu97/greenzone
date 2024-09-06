import React, { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonModal, IonTitle, IonToolbar, IonText } from '@ionic/react';
import Papa from 'papaparse';
import { supabase } from '../supabaseClient';

/* Uses the "Papa Parse" library since I couldn't be fucked writing my own, and they seem to do it way better.
 * https://www.papaparse.com/
 */

interface JourneyUploadContainerProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const JourneyUploadContainer: React.FC<JourneyUploadContainerProps> = ({ user, isOpen, onClose }) => {
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Parsing file...');

    Papa.parse(file, {
      complete: async (results) => {
        setUploadStatus('File parsed. Uploading data...');
        try {
          // insert the kestrel device table data
          const { data: deviceData, error: deviceError } = await supabase
            .from('kestrel_devices')
            .insert({
              // type assertions are because I was getting: "TS2571: Object is of type 'unknown'."
              device_name: (results.data as any[][])[0][1] as string,
              device_model: (results.data as any[][])[0][1] as string,
              serial_number: (results.data as any[][])[1][1] as string,
              profile_id: user.id
            })
            .select()
            .single();

          if (deviceError) throw deviceError;

          // then insert the kestrel info
          const kestrelData = results.data.slice(3).map((row: any) => ({
            kestrel_device_id: deviceData.id,
            time_stamp: row[0],
            temperature: parseFloat(row[1]),
            relative_humidity: parseFloat(row[2]),
            heat_index: parseFloat(row[3]),
            dew_point: parseFloat(row[4]),
            data_type: row[5] || null,
            record_name: row[6] || null,
            start_time: row[7] || null,
            duration: row[8] || null,
            location_description: row[9] || null,
            location_address: row[10] || null,
            location_coordinates: row[11] ? `POINT(${row[11]})` : null,
            notes: row[12] || null
          }));

          const { error: kestrelError } = await supabase
            .from('kestrel_info')
            .insert(kestrelData);

          if (kestrelError) throw kestrelError;

          setUploadStatus('Data uploaded successfully!');
        } catch (error) {
          console.error('Error uploading data:', error);
          setUploadStatus('Error uploading data. Please try again.');
        }
      },
      header: true,
      skipEmptyLines: true
    });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Upload Kestrel Data</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} id="fileInput" />
        <IonButton expand="block" onClick={() => document.getElementById('fileInput')?.click()}>
          Select CSV File
        </IonButton>
        {uploadStatus && <IonText color="primary">{uploadStatus}</IonText>}
        <IonButton expand="block" onClick={onClose} className="ion-margin-top">Close</IonButton>
      </IonContent>
    </IonModal>
  );
};

export default JourneyUploadContainer;
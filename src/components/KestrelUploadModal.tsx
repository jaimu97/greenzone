import React, { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonModal, IonTitle, IonToolbar, IonText } from '@ionic/react';
import Papa from 'papaparse';
import { supabase } from '../supabaseClient';

/* Uses the "Papa Parse" library since I couldn't be bothered writing my own, and they seem to do it way better.
 * https://www.papaparse.com/
 */

interface JourneyUploadContainerProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const KestrelUploadModal: React.FC<JourneyUploadContainerProps> = ({ user, isOpen, onClose }) => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Parsing file...');
    setIsError(false);

    Papa.parse(file, {
      complete: async (results: Papa.ParseResult<string[]> /* for "TS2571: Object is of type 'unknown'." */) => {
        setUploadStatus('File parsed. Uploading data...');
        try {
          // insert the kestrel device table data
          const deviceName = results.data[0][1];
          const deviceModel = results.data[1][1];
          const serialNumber = results.data[2][1];

          console.log('Device Info:', { deviceName, deviceModel, serialNumber });

          const { data: deviceData, error: deviceError } = await supabase
            .from('kestrel_devices')
            .insert({
              device_name: deviceName,
              device_model: deviceModel,
              serial_number: serialNumber,
              profile_id: user.id
            })
            .select()
            .single();

          if (deviceError) throw deviceError;

          console.log('Inserted device:', deviceData);

          // then insert the kestrel info
          const kestrelData = results.data.slice(5).map((row: string[]) => {
            const dataPoint = {
              kestrel_device_id: deviceData!.id,
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
            };
            console.log('Data point:', dataPoint);
            return dataPoint;
          });

          console.log('Kestrel data to insert:', kestrelData);

          const { data: insertedData, error: kestrelError } = await supabase
            .from('kestrel_info')
            .insert(kestrelData)
            .select();

          if (kestrelError) throw kestrelError;

          console.log('Inserted kestrel data:', insertedData);

          setUploadStatus('Data uploaded successfully!');
          setIsError(false);
        } catch (error) {
          console.error('Error uploading data:', error);
          setUploadStatus('Error uploading data. Please try again.');
          setIsError(true);
        }
      },
      header: false,
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
        <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} id="fileInput" />
        <IonButton expand="block" onClick={() => document.getElementById('fileInput')?.click()}>
          Select CSV File
        </IonButton>
        {uploadStatus && (
          <IonText color={isError ? "danger" : "primary"} className="ion-text-center">
            <p>{uploadStatus}</p>
          </IonText>
        )}
        <IonButton color="medium" expand="block" onClick={onClose} className="ion-margin-top">Close</IonButton>
      </IonContent>
    </IonModal>
  );
};

export default KestrelUploadModal;
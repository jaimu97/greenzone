/* Reference:
 * https://ionic.io/blog/create-background-tasks-in-ionic-with-capacitor
 */

// Save a value to the Capacitor KV store
addEventListener('trackLocation', async (resolve, reject, args) => {
  try {
    console.log('trackLocation event fired');
    const location = await CapacitorGeolocation.getCurrentPosition();
    console.log('Current location:', JSON.stringify(location));
    const time = new Date().getTime();

    let locationsArr = [];
    try {
      const { value } = await CapacitorKV.get('LOCATIONS');
      if (value) {
        locationsArr = JSON.parse(value);
        if (!Array.isArray(locationsArr)) {
          locationsArr = [];
        }
      }
    } catch (e) {
      console.log('Error parsing existing locations:', e);
    }

    /* FIXME: Only storing time of reading not the location data.
     *   [{"time":1726475120069},{"time":1726649775935},{"time":1726653491177}]
     */
    locationsArr.push({
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading
      },
      time
    });

    await CapacitorKV.set('LOCATIONS', JSON.stringify(locationsArr));
    console.log('Location saved, total locations:', locationsArr.length);
    resolve({ success: true, message: 'Location saved', count: locationsArr.length });
  } catch (err) {
    console.error('Error in trackLocation:', err);
    reject({ success: false, error: err.toString() });
  }
});


// Get a value from the Capacitor KV store
addEventListener('loadLocations', async (resolve, reject, args) => {
  try {
    console.log('loadLocations event fired');
    const { value } = await CapacitorKV.get('LOCATIONS');
    console.log('Retrieved value:', value);

    let locationsArr = [];
    if (value) {
      locationsArr = JSON.parse(value);
      if (!Array.isArray(locationsArr)) {
        locationsArr = [];
      }
    }

    console.log('Parsed locations:', JSON.stringify(locationsArr));
    resolve({ success: true, locations: locationsArr });
  } catch (err) {
    console.error('Error in loadLocations:', err);
    reject({ success: false, error: err.toString() });
  }
});

// Clear all locations from the Capacitor KV store
addEventListener('clearLocations', async (resolve, reject, args) => {
  try {
    console.log('clearLocations event fired');
    await CapacitorKV.remove('LOCATIONS');
    console.log('Locations cleared');
    resolve({ success: true, message: 'Locations cleared' });
  } catch (err) {
    console.error('Error in clearLocations:', err);
    reject({ success: false, error: err.toString() });
  }
});

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
      const { value } = CapacitorKV.get('LOCATIONS');
      if (value) {
        locationsArr = JSON.parse(value);
        if (!Array.isArray(locationsArr)) {
          locationsArr = [];
        }
      }
    } catch (e) {
      console.log('Error parsing existing locations:', e);
    }

    locationsArr.push({ location: location.coords, time });

    CapacitorKV.set('LOCATIONS', JSON.stringify(locationsArr));
    console.log('Location saved, total locations:', locationsArr.length);
    resolve({ success: true, message: 'Location saved', count: locationsArr.length });
  } catch (err) {
    console.error('Error in trackLocation:', err);
    reject({ success: false, error: err.toString() });
  }
});


// Get a value from the Capacitor KV store
addEventListener('loadLocations', (resolve, reject, args) => {
  try {
    console.log('loadLocations event fired');
    const { value } = CapacitorKV.get('LOCATIONS');
    console.log('Retrieved value:', value);

    let locationsArr = [];
    if (value) {
      locationsArr = JSON.parse(value);
      if (!Array.isArray(locationsArr)) {
        locationsArr = [];
      }
    }

    resolve({ success: true, locations: locationsArr });
  } catch (err) {
    console.error('Error in loadLocations:', err);
    reject({ success: false, error: err.toString() });
  }
});
/* Reference:
 * https://ionic.io/blog/create-background-tasks-in-ionic-with-capacitor
 */

// Save a value to the Capacitor KV store
addEventListener('trackLocation', async (resolve, reject, args) => {
  try {
    console.log('trackLocation event fired');
    const location = await CapacitorGeolocation.getCurrentPosition();
    const time = new Date().getTime();

    const { value } = CapacitorKV.get('LOCATIONS');
    let locationsArr = [{ location, time }];

    try {
      const parsedArr = JSON.parse(value);
      locationsArr = [...parsedArr, { location, time }];
    } catch (e) {
      console.log('No existing locations');
    }

    CapacitorKV.set('LOCATIONS', JSON.stringify(locationsArr));
    console.log('Location saved:', JSON.stringify(locationsArr));
    resolve();
  } catch (err) {
    console.error('Error in trackLocation:', err);
    reject(err);
  }
});

// Get a value from the Capacitor KV store
addEventListener('loadLocations', (resolve, reject, args) => {
  try {
    console.log('loadLocations event fired');
    const { value } = CapacitorKV.get('LOCATIONS');
    console.log('Retrieved value:', value);
    try {
      const arr = JSON.parse(value);
      resolve(arr);
    } catch (e) {
      resolve([]);
    }
  } catch (err) {
    console.error('Error in loadLocations:', err);
    reject([]);
  }
});

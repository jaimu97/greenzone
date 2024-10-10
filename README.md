# Green Zone

## Notes:

### Please read this section carefully as items here may need changes before deploying to users!

- Users that select 'staff' as their role when signing up are able to search journeys from all users and can delete any
user's journeys.

## Setup:

Download node.js and npm. I'm on a Mac, so you're gonna need to figure that out yourself, unfortunately. 

See [here](https://nodejs.org/en) for the node.js website with install instructions.

Once you have node.js and npm installed, clone this repository onto your machine and `cd` into it.

For example:

```bash
git clone git@github.com:jaimu97/greenzone.git
cd greenzone
```

Then install all the dependences with:

```bash
npm install
```

This command should install everything needed including `ionic`.

Once ionic is installed, you should be able to run:

```bash
ionic serve
```

This starts a localhost server that you can access. Changes made will automatically update on the page it opens. 

## Android:

You'll need to install Android Studio from [here](https://developer.android.com/studio) and install the Android capacitor:

```bash
npm install @capacitor/android
```

Once that is installed, you *should* be able to run this:

```bash
ionic cap add android 
ionic cap copy
ionic cap sync
```

in the same directory as where you 
were running `ionic serve`.

This will make an Android Studio project for you to use and then 'compile' the project, coping over the files.

Next, run:

```bash
ionic cap open android
```

This will open up Android Studio in the `greenzone/android` directory. 

### !! IMPORTANT !!

Once it's open, you will need to manually add location access to the `AndroidManifest.xml`

If you do not do this, you will get errors trying to record journeys since the capacitor does not do this automatically.

Once Android Studio is open, open this file: `android/app/src/main/AndroidManifest.xml`.

Inside Android Studio this is found in `app/manifests/AndroidManifest.xml`. This is same file, as above just represented
differently.

Inside the manifest file, add the following lines **at the top of the file** after the `<manifest>` tag but before the
`<application>` tag:

```xml
<!-- Permissions -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Geolocation API -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
```

With that copied in, you should be able to click the green play button in the top right which should build the app and 
open it on an emulator or device.

Any other problems, see ionic's documentation 
[here](https://ionicframework.com/docs/react/your-first-app/deploying-mobile#capacitor-setup).

## iOS:

iOS works more or less the same as Android. Install the iOS capacitor and Xcode:

```bash
npm install @capacitor/ios
```

[Xcode App Store Link](https://apps.apple.com/au/app/xcode/id497799835?mt=12)

Once that is installed, like Android, run this:

```bash
ionic cap add ios 
ionic cap copy
ionic cap sync
```

Then open with:

```bash
ionic cap open ios
```

### !! IMPORTANT !!

The app will *(probably)* build as-is once Xcode opens, however, things like the camera, camera roll, GPS and so on will
not until you set its permissions in the `info.plist`. To do this, on the left-hand panel, under the app directory,
go to `App -> App -> Info` and add the following items:

```
Privacy - Camera Usage Description
Privacy - Photo Library Additions Usage Description
Privacy - Photo Library Usage Description
Privacy - Location When In Use Usage Description
```

The `type` should automatically be set as `string` and the `value` column can remain empty.

### Possible Build Errors:

You will get errors on initial build after running `cap add` for the first time, this is because the package name 
`io.ionic.starter` is not available. This error can be ignored if you are not deploying the app on a real device.

If you do plan on building on a real device, set this to something like `ionic.greenzone.testflight`.
Double-check with your Apple developer account to see if there's restrictions on the naming scheme or required sections.

There maybe some errors related to "Pods" when building. Error looks like `./Pods/Pods...xcconfig unable to open file`
if you see this, you're probably missing [CocoaPods](https://cocoapods.org/). My recommendation is to install it through
homebrew instead with `brew install cocoapods`. Once this is installed, delete the `./ios` directory and try run
`ionic cap add ios; ionic cap copy; ionic cap sync` again.

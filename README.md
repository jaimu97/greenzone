# Green Zone

## Setup:

Download node.js and npm. I'm on a Mac, so you're gonna need to figure that out yourself, unfortunately. 

See [here](https://nodejs.org/en) for the node,js website.

Once you have node.js and npm installed, create a folder and install ionic inside of it.

You should be able to run the following commands:

```bash
npm install -g @ionic/cli
npm install @supabase/supabase-js
```

Here's a [link](https://ionicframework.com/docs/intro/cli) to their setup guide.

Once ionic is installed, clone this repo into the folder where ionic is as a subdirectory.

For example:

If you're project folder is called `ionic` then you clone this project inside of it like this:

`ionic/greenzone`

Then, you should be able to `cd` into the folder and run `ionic serve` and it'll start a localhost server that you can 
access. Changes made will automatically update on the page it opens. 

## Android:

You'll need to install Android Studio from [here](https://developer.android.com/studio) and install the Android capacitor:

```bash
npm install @capacitor/android
```

Once that is installed, you *should* be able to run this:

```
ionic cap add android 
ionic cap copy
```

in the same directory as where you 
were running `ionic serve`.

This will make an Android Studio project for you to use and then 'compile' the project, coping over the files.

Next, run:

```
ionic cap open android
```

This will open up Android Studio in the `greenzone/android` directory. 

Once it's open, click the green play button in the top right which should build the app and open it on an emulator or 
device.

Any other problems, see ionic's documentation 
[here](https://ionicframework.com/docs/react/your-first-app/deploying-mobile#capacitor-setup).

## iOS:

**No.**

Please don't add the `ios` capacitor, or it'll break building the android project since the `ionic cap copy` command tries
to build for both at the same time. If you're not on a Mac with Xcode installed, this will error out and leave you with 
an incomplete project.

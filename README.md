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

## Sources:

Pages I've *borrowed* code from. (For reference later if needed)

- https://legacy.reactjs.org/docs/hooks-state.html
- https://ionicframework.com/docs/react/navigation#ionpage
- https://ionic.io/ionicons
- https://ionicframework.com/docs/components
- https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-react
- https://dev.to/raaynaldo/javascript-datetime-111e

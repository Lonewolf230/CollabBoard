# CollabBoard

Built with TypeScript, Fabric.js, and React, this app allows users to create interactive canvases with tools like pen, pencil, brush, highlighter, text boxes, color selection, and more. The state of the canvas is persisted in Firestore, and users can export their creations as JPEG or PDF. The app features an interactive dashboard and allows users to invite others by email, granting read/write access to collaborate on the canvas. Real-time collaboration is powered by Socket.io, ensuring seamless syncing between multiple users. Nodemailer is used for sending email invitations which uses Node.js. The backend is hosted on Render, with an inactivity timeout after 15 minutes, and the frontend is deployed on Vercel.


### Frontend

The frontend is built using React.js and TypeScript and utilises react-router-dom for routing in the app.
The app uses Firebase for writing client-side code for connecting to firebase services.

First of traverse to the frontend directory /collabboard using  
`cd collabboard`

install the necessary dependencies using  
`npm install`

then set up the `.env` file in the root of the `collabboard` folder like this
```
VITE_APIKEY=
VITE_AUTHDOMAIN=
VITE_PROJECTID=
VITE_STORAGEBUCKET=
VITE_MESSAGINGSENDERID=
VITE_APPID=
VITE_MEASUREMENTID=
VITE_DATABASEURL=
VITE_BACKEND_URL=http://localhost:3000
```

the `VITE` prefix is important for Vite to use the environment variables.

replace ```VITE_BACKEND_URL``` with the url you get after deployment of ur backend.

These variables can be found as soon as the project is created in Firebase console and the Web app is registered. We will get a config setup like this

```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
  measurementId: import.meta.env.VITE_MEASUREMENTID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth=getAuth(app);
const provider=new GoogleAuthProvider()
const firestore=getFirestore(app)

export { auth,provider,firestore };
```

this is the configuration needed for this project


### Backend

The backend is setup using Node.js, Express.js and Socket.io and Nodemailer for sending mails

Traverse to the backend folder /backend by   
`cd backend`

Then install the needed dependencies using  
`npm install`

Then set up the .env file like this  
```
PORT=3000
EMAIL_ID=
PASSWORD=''
```

So what is this EMAIL_ID and PASSWORD. They are necessary for sending mails and look into [Nodemailer Setup](#nodemailer)

Then run the backend on your local machine using the command  
`npm run dev`


### Nodemailer

Nodemailer is necessary for sending mails to users.
In this setup I have created a new email solely for the purpose of sending invite mails on behalf of the app.

```
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_ID,
        pass:process.env.PASSWORD
    }
})
```

This service is configured for GMail so 
1. Create a new GMail account or use an existing one
2. Set up 2-Factor Authentication
3. Once done go to App Passwords section
4. Name your app and get a 16-character password. This will be shown only once so copy it to some place safe.

In the [Backend](#backend) `.env` file `EMAIL_ID` is this newly created E-mail ID and `PASSWORD` is the generated 16-character password.


### Render 

Render is used for hosting the backend and this is the choice because of the free tier and compatibility for web-sockets. Connect your git repo from GitHub and then set the root folder as `/backend`.

Set up the build command as `npm install && npm run build`
and the
Start command as `npm start`

and any other env-variables that you would want to add.

The backend turns off after 15 minutes of inactivity just restart the service.

### Vercel

Set the template as VITE
Similarly link the git repo from GitHub and then set the root folder to `/collabboard`.
Set up all the firebase keys as .env variables 

Note: the `VITE_BACKEND_URL` is now set to the domain provided by [Render](#render) after it is deployed.

Note: `vercel.json` file
This file must be set up in the root of `/collabboard`

```
{
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
}
```

This is necessary because Vercel is not aware of routing offered by `react-router-dom` and hence will give out error `404 NOT_FOUND` on refreshing. So this configuration will point vercel to `index.html` whenever a unknown route is hit and hence `react-router-dom` kicks in from there.

### Authorised Domains

This app uses Google Sign-In which will work flawlessly in `localhost` but will fail in production since the app is not authorised to firebase. 
To solve this login to `Firebase->Project->Authentication->Settings->Authorised Domains` and add the url provided by [Vercel](#vercel) after deployment. Wait for 10-20 seconds and try again it will work. In case it doesn't hard reload the browser.





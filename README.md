# Blogger

Built using React, Node.js, Express.js, and integrated with AWS services like DynamoDB, S3, and Cognito. This web application allows users to write and preview blogs in Markdown, embedding images, videos, and YouTube links. It also provides social features, enabling users to follow and unfollow other users, like and unlike posts, as well as comment and uncomment content. The app leverages AWS services for authentication (via Cognito) and content storage (using DynamoDB for the database and S3 for media storage).

### Front-End

Traverse to the /blogger-frontend folder using the command  
`cd blogger-frontend`

then the command  
`npm i` 
to install all the dependencies for the react project.

Then create the .env file in the blogger-frontend folder

```
VITE_REGION=''
VITE_AWS_ACCESS_KEY_ID=''
VITE_AWS_SECRET_ACCESS_KEY=''
VITE_BUCKET=''
VITE_REACT_APP_API_URL='http://localhost:5000/api'
VITE_COGNITO_POOL_ID=''
```

then run the frontend using the command  

`npm run dev`


### Backend

This part uses Node.js, Express.js.
So make sure you have Node.js installed on your system.

Traverse to the /backend folder  

`cd backend`

then install the necessary dependencies using  

`npm i`

then create a .env file containing the necessary api keys

```
USER_POOL_ID=''
CLIENT_ID=''
PORT=5000
JWT_SECRET=''
REGION=''
AWS_ACCESS_KEY_ID=''
AWS_SECRET_ACCESS_KEY=''
```

the variable `PORT` is set up as the port you want to run the backend in
the variable `JWT_SECRET` is a random string that you use for the JWT authentication.

once done you can run the backend using the command  

`nodemon app.js`

const functions = require('firebase-functions');
//Cors
const cors = require('cors');

//Express stuffs
const express = require('express');
const app = express();
app.use(cors());

//Middleare
const FBAuth = require('./util/fbAuth');

//User stuff
const { signup, login, uploadImage, updateUserDetails, getAuthenticatedUser } = require('./handlers/users');

//Post stuff
const { getAllPosts } = require('./handlers/posts');

//User Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, updateUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

//Post stuff
app.get('/posts', FBAuth, getAllPosts);

exports.api = functions.region('us-east1').https.onRequest(app);

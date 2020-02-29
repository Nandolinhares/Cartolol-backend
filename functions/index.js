const functions = require('firebase-functions');

//Express stuffs
const express = require('express');
const app = express();

//Middleare
const FBAuth = require('./util/fbAuth');

//User stuff
const { signup, login } = require('./handlers/users');

//Post stuff
const { getAllPosts } = require('./handlers/posts');

app.post('/signup', signup);
app.post('/login', login);

//Post stuff
app.get('/posts',FBAuth, getAllPosts);

exports.api = functions.region('us-east1').https.onRequest(app);

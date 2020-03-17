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
const { signup, login, uploadImage, updateUserDetails, getAuthenticatedUser, buyPlayer, getUserTeam } = require('./handlers/users');
//Player Stuff
const { createPlayer, uploadPlayerImage, getAllPlayers, getPlayer, updatePlayerDetails } = require('./handlers/players');

//Post stuff
const { getAllPosts } = require('./handlers/posts');

//User Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, updateUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.post('/user/player/:player', FBAuth, buyPlayer);
app.get('/user/team', FBAuth, getUserTeam);

//Player Routes
app.post('/player/create', FBAuth, createPlayer);
app.post('/player/image/:name', FBAuth, uploadPlayerImage);
app.get('/players', FBAuth, getAllPlayers);
app.get('/players/:name', FBAuth, getPlayer);
app.post('/player/:name', FBAuth, updatePlayerDetails);

//Post stuff
app.get('/posts', FBAuth, getAllPosts);

exports.api = functions.region('us-east1').https.onRequest(app);



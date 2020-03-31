const functions = require('firebase-functions');
//Cors
const cors = require('cors');

const { db } = require('./util/admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;

//Express stuffs
const express = require('express');
const app = express();
app.use(cors());

//Middleare
const FBAuth = require('./util/fbAuth');

//User stuff
const { signup, login, uploadImage, updateUserDetails, getAuthenticatedUser, 
        buyPlayer, getUserTeam, removePlayerfromUserTeam, resetPoints, updateUserPoints, resetUserPassword,
        getUsersByPoints, getUserProfile } = require('./handlers/users');
//Player Stuff
const { createPlayer, uploadPlayerImage, getAllPlayers, getPlayer, updatePlayerDetails, updatePlayerPoints } = require('./handlers/players');

//Leagues Stuff
const { createLeague, addFriendToLeague, getMyLeagues, getUserLeagues, getOneLeague } = require('./handlers/leagues');

//Post stuff
const { getAllPosts } = require('./handlers/posts');

//User Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, updateUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.post('/user/player/:player/:playerPosition', FBAuth, buyPlayer);
app.get('/user/team', FBAuth, getUserTeam);
app.delete('/user/:player/delete', FBAuth, removePlayerfromUserTeam);
app.post('/users/reset', FBAuth, resetPoints);
app.post('/users/updatePoints', FBAuth, updateUserPoints);
app.post('/resetUserPassword', resetUserPassword);
app.get('/users/position', getUsersByPoints);
app.get('/users/profile/:handle', getUserProfile);

//Player Routes
app.post('/player/create', FBAuth, createPlayer);
app.post('/player/image/:name', FBAuth, uploadPlayerImage);
app.get('/players', FBAuth, getAllPlayers);
app.get('/players/:name', FBAuth, getPlayer);
app.post('/player/:name', FBAuth, updatePlayerDetails);
//app.post('/players/:player/updatePoints', FBAuth, updatePlayerPoints);

//Leagues Routes
app.post('/leagues/create', FBAuth, createLeague); 
app.post('/leagues/addFriend/:league/:handleFriend', FBAuth, addFriendToLeague);
app.get('/user/leagues', FBAuth, getMyLeagues);
app.get('/user/leagues/:handle', getUserLeagues);
app.get('/leagues/:league', getOneLeague);

//Post stuff
app.get('/posts', FBAuth, getAllPosts);

exports.api = functions.region('us-east1').https.onRequest(app);

//Usando a definição de wildcard do firebase
//In this example, when any field on any document in users is changed, it matches a wildcard called playerId.
 exports.onPlayerDetailsChange = functions.region('us-east1').firestore.document('/players/{playerId}')
    .onUpdate((change) => {

        if(change.before.data() !== change.after.data()){
           const batch = db.batch();
           return db.collection('users').where("userTeam", "array-contains" , change.before.data()).get()
                .then(data => {
                    data.forEach(doc => {
                        const user = db.doc(`/users/${doc.id}`);
                        batch.update(user, { userTeam: FieldValue.arrayRemove(change.before.data()) });
                        batch.update(user, { userTeam: FieldValue.arrayUnion(change.after.data()) });
                    });
                    return batch.commit();  
                });
        } else {
            return true;
        }
    });

exports.onUserDetailsChange = functions.region('us-east1').firestore.document('/users/{userId}')
.onUpdate((change) => {

    if(change.before.data() !== change.after.data()){
        const batch = db.batch();
        return db.collection('leagues').where("friends", "array-contains" , change.before.data()).get()
            .then(data => {
                 data.forEach(doc => {
                    const league = db.doc(`/leagues/${doc.data().name}`);
                    batch.update(league, { friends: FieldValue.arrayRemove(change.before.data()) });
                    batch.update(league, { friends: FieldValue.arrayUnion(change.after.data()) });
                })
                return batch.commit();
            })
            .catch(err => console.error(err));
    } else {
        return true;
    }
})

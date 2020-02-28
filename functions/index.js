const functions = require('firebase-functions');

//Express stuffs
const express = require('express');
const app = express();

//Admin stuffs
const { admin, db } = require('./util/admin');

//User stuff
const { signup } = require('./handlers/users');

app.post('/signup', signup);


app.get('/posts', (req, res) => {
    db.collection('posts').get()
        .then((data) => {
            let posts = [];
            data.forEach((doc) => {
                posts.push(doc.data());
            })
            return res.json(posts);
        })
        .catch(err => {
            return console.error(err);
        })
});

exports.api = functions.region('us-east1').https.onRequest(app);

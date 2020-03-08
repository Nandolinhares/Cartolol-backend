const admin = require('firebase-admin');

var serviceAccount = require('../cartolol-fd251-firebase-adminsdk-fzu8u-8c2ead95a4.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cartolol-fd251.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };

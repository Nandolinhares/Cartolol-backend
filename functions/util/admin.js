const admin = require('firebase-admin');

var serviceAccount = require('../cartolalol-firebase-adminsdk-1sk4y-424400e0d5.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cartolalol.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };

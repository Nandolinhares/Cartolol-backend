const { admin, db } = require('../util/admin');
const config = require('../util/config');
const FieldValue = require('firebase-admin').firestore.FieldValue;

exports.createLeague = (req, res) => {
    const leagueDetails = {
        name: req.body.name,
        creatorHandle: req.user.handle,
        creatorImageUrl: req.user.imageUrl,
        creatorPoints: req.user.points,
        imageName: req.body.imageName,
        leagueImageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${req.body.imageName}?alt=media`,
        friends: [],
        createdAt: new Date().toISOString()
    }

    db.doc(`/leagues/${leagueDetails.name}`).get()
        .then(doc => {
            let errors = {};
            if(doc.exists) {
                errors.status = true;
                errors.message = 'Já existe uma liga com esse nome';
            }
            return errors;
        })
        .then(errors => {
            if(errors.status === true) {
                return res.status(400).json(errors);
            } else {
                db.doc(`/leagues/${leagueDetails.name}`).set(leagueDetails)
                    .then(doc => {
                        return res.status(200).json({ message: 'A liga foi criado com sucesso' });
                    })
            }
        })
        .catch(err => console.error(err));
}

exports.addFriendToLeague = (req, res) => {
    let myFriend = {};
    db.collection('users').where('handle', '==', req.params.handleFriend).get()
        .then(data => {
            data.forEach(doc => {
                myFriend = doc.data();
            })
            if(Object.keys(myFriend).length === 0){
                return res.status(500).json({ message: 'O usuário não existe' });
            } else {
                return myFriend;
            }
        })
        .then(myFriend => {
            db.collection('leagues').where('creatorHandle', '==', req.user.handle).get()
                .then(data => {
                    let errors = {};
                    data.forEach(doc => {
                        errors = doc.data();          
                    });
                    if(Object.keys(errors).length === 0){
                        return res.status(500).json({ message: 'Você não tem uma liga' });
                    } else {
                        return myFriend;
                    }
                })
                .then(myFriend => {   
                    db.collection('leagues').where('creatorHandle', '==', req.user.handle)
                        .where('name', '==', req.params.league).get()
                        .then(data => {
                            data.forEach(doc => {
                                if(doc.data().friends.some(array => array.handle === req.params.handleFriend)){
                                    return res.status(400).json({ message: 'O usuário já existe na sua liga' });
                                } else {
                                    doc.ref.update({"friends": FieldValue.arrayUnion(myFriend)});
                                    return res.json({ message: 'O seu amigo foi adicionado a liga' });
                                }
                            })
                        })
                    }
                )
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: err.code });
                });
            })
}

exports.getMyLeagues = (req, res) => {
    db.collection('leagues').where('creatorHandle', '==', req.user.handle).get()
        .then(data => {
            let myLeagues = [];
            data.forEach(doc => {
                myLeagues.push(doc.data());
            })
            return myLeagues;
        })
        .then(myLeagues => {
            db.collection('leagues').get()
                .then(data => {
                    data.forEach(doc => {
                        if(doc.data().friends.some(array => array.handle === req.user.handle)) {
                            myLeagues.push(doc.data());
                        }
                    });
                    if(Object.keys(myLeagues).length > 0) {
                        return res.json(myLeagues);
                    } else {
                        return res.json({ message: 'Você não participa de nenhuma liga' });
                    }
                })
        })
}

exports.getUserLeagues = (req, res) => {
    db.collection('leagues').get()
        .then(data => {
            let userLeagues = [];
            data.forEach(doc => {
                if(doc.data().creatorHandle === req.params.handle) {
                    userLeagues.push(doc.data());
                }
            })
            return userLeagues;
        })
        .then(userLeagues => {
            db.collection('leagues').get()
                .then(data => {
                    data.forEach(doc => {
                        if(doc.data().friends.some(array => array.handle === req.params.handle)) {
                            userLeagues.push(doc.data());
                        } 
                    })
                    if(Object.keys(userLeagues).length > 0) {
                        return res.json(userLeagues);
                    } else {
                        return res.json({ message: `O usuário ${req.params.handle} não participa de ligas` });
                    }
                })
        })
        .catch(err => console.error(err));
}

exports.getOneLeague = (req, res) => {
    db.collection('leagues').where('name', '==', req.params.league).get()
        .then(data => {
            let league = {};
            data.forEach(doc => {
                league = doc.data();
            })
            if(Object.keys(league).length > 0) {
                return res.json(league);
            } else {
                return res.status(400).json({ message: 'A liga que você procura não existe' });
            }
        })
        .catch(err => console.error(err));
}
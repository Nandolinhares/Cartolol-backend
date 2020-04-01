const { admin, db } = require('../util/admin');
const config = require('../util/config');
const FieldValue = require('firebase-admin').firestore.FieldValue;

const { reduceLeagueDetails } = require('../util/validators');

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

    const { errors, valid } = reduceLeagueDetails(leagueDetails);
    if(!valid) {
        return res.status(400).json(errors);
    }

    db.doc(`/leagues/${leagueDetails.name}`).get()
        .then(doc => {
            let errors = {};
            if(doc.exists) {
                errors.status = true;
                errors.name = 'Já existe uma liga com esse nome';
            }
            return errors;
        })
        .then(errors => {
            if(errors.status === true) {
                return res.status(400).json(errors);
            } else {
                db.doc(`/leagues/${leagueDetails.name}`).set(leagueDetails)
                    .then(doc => {
                        leagueId = doc.id;
                        return leagueId;
                    })
                    .then(leagueId => {
                        db.collection('users').where('handle', '==', req.user.handle).get()
                            .then(data => {
                                let user = {};
                                data.forEach(doc => {
                                    user = doc.data(); 
                                });
                                if(Object.keys(user).length > 0) {
                                    return user;
                                } else {
                                    return res.status(400).json({ message: 'Usuário não encontrado' });
                                }
                            })
                            .then(user => {
                                db.doc(`/leagues/${leagueDetails.name}`).get()
                                    .then(doc => {
                                        doc.ref.update({ "friends": FieldValue.arrayUnion(user) });
                                        return res.json({ message: 'A liga foi criada com sucesso' });
                                    })
                            })
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
    db.collection('leagues').get()
        .then(data => {
            let myLeagues = [];
            data.forEach(doc => {
                if(doc.data().friends.some(array => array.handle === req.user.handle)) {
                    myLeagues.push(doc.data());
                }
            });
            if(Object.keys(myLeagues).length > 0) {
                myLeagues.forEach((league, i) => {
                    myLeagues[i].friends.sort(function(a, b){
                        return a.points - b.points
                    }).reverse()
                })
                return res.json(myLeagues);
            } else {
                return res.json({ message: 'Você não participa de nenhuma liga' });
            }
        })
        .catch(err => console.error(err));
}

exports.getUserLeagues = (req, res) => {  
    db.collection('leagues').get()
        .then(data => {
            let userLeagues = []; 
            data.forEach(doc => {
                if(doc.data().friends.some(array => array.handle === req.params.handle)) {
                    userLeagues.push(doc.data());
                }  
            })
            if(Object.keys(userLeagues).length > 0) {
                return res.json(userLeagues);
            } else {
                return res.status(500).json({ message: `O usuário ${req.params.handle} não participa de ligas` });
            }
        })
        .catch(err => console.error(err));
}

exports.getOneLeague = (req, res) => {
    db.collection('leagues').where('name', '==', req.params.league).get()
        .then(data => {
            let league = [];
            data.forEach(doc => {
                league.push(doc.data());
            })
            if(Object.keys(league).length > 0) {
                return res.json(league);
            } else {
                return res.status(400).json({ message: 'A liga que você procura não existe' });
            }
        })
        .catch(err => console.error(err));
}

exports.removeUserFromLeague = (req, res) => {
    let myFriend = {};
    db.doc(`/users/${req.params.handle}`).get()
        .then(doc => {
            myFriend = doc.data();
            return myFriend;
        })
        .then(myFriend => {
            db.collection('leagues').where('creatorHandle', '==', req.user.handle).where('name', '==', req.params.league).get()
                .then(data => {
                    let leagueName = '';
                    data.forEach(doc => {
                        if(doc.data().creatorHandle === myFriend.handle) {
                            return res.status(400).json({ message: 'Você não pode se remover da própria liga' });
                        } else if(doc.data().friends.some(array => array.name === myFriend.name)) {
                            doc.ref.update({"friends": FieldValue.arrayRemove(myFriend)});
                            leagueName = doc.data().name;
                            return res.status(200).json({ message: `O amigo ${myFriend.name} foi removido da liga ${leagueName}` });
                        } else {
                            return res.status(400).json({ message: 'O membro não está na liga' });
                        }
                    })
                })
        })
        .catch(err => console.error(err));   
}
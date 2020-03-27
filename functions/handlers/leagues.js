const { admin, db } = require('../util/admin');
const config = require('../util/config');

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
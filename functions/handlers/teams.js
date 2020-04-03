const { db } = require('../util/admin');

exports.getTeamsByPoints = (req, res) => {
    db.collection('teams').orderBy('wins', 'desc').get()
        .then(data => {
            let teams = [];
            data.forEach(doc => {
                teams.push(doc.data());
            });
            if(Object.keys(teams).length > 0) {
                return res.json(teams);
            } else {
                return res.status(400).json({ message: 'Não tem times cadastrados' });
            }
        })
        .catch(err => console.error(err));
}
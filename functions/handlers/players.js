const { admin, db } = require('../util/admin');
const { validatePlayers } = require('../util/validators');

const config = require('../util/config');
const BusBoy = require('busboy');

const { reducePlayerDetails } = require('../util/validators');

exports.createPlayer = (req, res) => {

    const isAdmin = req.user.administrator;

    if(isAdmin) {
        const noImg = 'no-img.png';  
        const playerData = {
            name: req.body.name,
            position: req.body.position,
            team: req.body.team,
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
            price: req.body.price,
            createdAt: new Date().toISOString()
        }

        const { errors, valid } = validatePlayers(playerData);

        if(!valid) {
            return res.status(400).json(errors);
        } 

        db.collection('players').where('name', '==', playerData.name).get()
            .then(data => {
                const error = {};
                data.forEach(doc => {
                    if(doc.exists){
                       error.status =  true;
                       error.message = 'O jogador já existe no sistema';    
                    }
                });
                return error;
            })
            .then((error) => {
                if(error.status === true){
                    return res.status(400).json(error);
                } else {
                    db.collection('players').add(playerData)
                        .then(doc => {
                            playerData.id = doc.id;
                            res.json(playerData);
                        })
                        .catch(err => {
                            console.error(err);
                            res.status(500).json({ error: err.code });
                        })
                }
            })
            .catch(err => console.error(err));

            
              
    } else {
        return res.status(401).json({ message: 'Você não tem autorização para cadastrar um jogador.' });
    }
}

exports.getAllPlayers = (req, res) => {

    const players = [];

    db.collection('players').get()
        .then(data => {
            data.forEach(doc => {
                players.push({
                    playerId: doc.id,
                    name: doc.data().name,
                    position: doc.data().position,
                    team: doc.data().team,
                    price: doc.data().price,
                    imageUrl: doc.data().imageUrl,
                    createdAt: doc.data().createdAt
                });
            })
            return res.status(200).json(players);
        })
        .catch(err => console.error(err));  
}

exports.updatePlayerDetails = (req, res) => {
    const isAdmin = req.user.administrator;

    if(isAdmin){
        const { playerDetails, errors, valid } = reducePlayerDetails(req.body);

        if(!valid) {
            return res.status(400).json(errors);
        }

        db.collection('players').where('name', '==', req.params.name).get()
            .then(data => {
               data.forEach(doc => {
                   doc.ref.update(playerDetails);
               })
               return res.status(200).json({ message: 'As informações do jogador foram atualizadas' });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code })
            })
    } else {
        return res.status(401).json({ message: 'Você não tem permissão para editar informações dos jogadores' });
    }
}

exports.getPlayer = (req, res) => {
    const isAdmin = req.user.administrator;
    let player = {};
 
    if(isAdmin){
        db.collection('players').where('name', '==', req.params.name).get()
            .then(data => {
                data.forEach(doc => {
                    player = doc.data();
                });
                return res.json(player);
            })
            .catch(err => console.error(err));
    } else {
        return res.status(401).json({ error: 'Você não tem autorização para isso' });
    }
}

//Upload image
exports.uploadPlayerImage = (req, res) => {
    const path = require('path'); //default package installed in every node
    const os = require('os'); //igual
    const fs = require('fs'); //file system

    const isAdmin = req.user.administrator;

    const busboy = new BusBoy({ headers: req.headers }); 

    let imageFileName;
    let imageToBeUploaded = {}; //Empty Object

    if(isAdmin){
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
                return res.status(400).json({ error: 'O arquivo não é válido' });
            }
             //my.image.png
             const imageExtension = filename.split('.')[filename.split('.').length -1];
             //46498484984.png
             imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`;
             const filepath = path.join(os.tmpdir(), imageFileName);
             imageToBeUploaded = { filepath, mimetype }
     
             file.pipe(fs.createWriteStream(filepath));
         });
     
         busboy.on('finish', () => {
            admin.storage().bucket(config.storageBucket).upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db.collection(`players`).where('name', '==', req.params.name).get()
                    .then(data => {
                        const previousImage = [];
                        data.forEach(doc => {
                            previousImage.push({
                                url: doc.data().imageUrl
                            })
                            doc.ref.update({ imageUrl })
                        })
                        return previousImage;
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: err.code });
                    })
            })
            .then((previousImage) => {
                previousImage.forEach(doc => {
                    const photoName = doc.url.split('.')[4].slice(6); // 158941894849
                    const photoExtension = doc.url.split('.')[5].slice(0, doc.url.split('.')[5].indexOf('?'))//png, jpg, jpeg
                    const photo = `${photoName}.${photoExtension}`;
                    if(photo !== 'no-img.png'){
                        admin.storage().bucket(config.storageBucket).file(photo).delete();
                    }
                    //Deleta a foto anterior do usuário
                });
                return res.json({ message: 'Imagem atualizada com sucesso' });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
         });
    } else {
        return res.status(401).json({ error: 'Você não tem autorização para isso' });
    }

    busboy.end(req.rawBody);
};
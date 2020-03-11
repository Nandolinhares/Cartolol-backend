const { admin, db } = require('../util/admin');

const config = require('../util/config');
const BusBoy = require('busboy');

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

//Upload image
exports.uploadPlayerImage = (req, res) => {
    const path = require('path'); //default package installed in every node
    const os = require('os'); //igual
    const fs = require('fs'); //file system

    const busboy = new BusBoy({ headers: req.headers }); 

    let imageFileName;
    let imageToBeUploaded = {}; //Empty Object

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
                   data.forEach(doc => {
                       doc.ref.update({ imageUrl })
                   })
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: err.code });
                })
        })
        .then(() => {
            return res.json({ message: 'Imagem atualizada com sucesso' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
    });

    busboy.end(req.rawBody);
};
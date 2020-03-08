//User stuff
const { admin, db } = require('../util/admin');

const config = require('../util/config');
const firebase = require('firebase');
const BusBoy = require('busboy');

firebase.initializeApp(config);
//firebase.analytics();


//Validators
const { validateSignUp, validateLogin, reduceUserDetails } = require('../util/validators');

exports.signup = (req, res) => {
    //Informações do usuário a ser cadastrado
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    
    const { errors, valid } = validateSignUp(newUser);

    if(!valid) {
        return res.status(400).json(errors);
    } 

   const noImg = 'no-img.png';    
   let token, userId;
   db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({ handle: 'O nome de usuário já existe' });
        }
        else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    })
    .then(data => {
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then(idToken => {
        token = idToken; 
        //Credenciais a serem adicionadas ao doc do user
        const userCredentials = {
            name: newUser.name,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            handle: newUser.handle,
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
            userId
        }
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
        return res.status(201).json({ token });
    })
    .catch(err => {
         console.error(err);
         if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({ email: 'O email já está em uso' });
        } else{
            return res.status(500).json({ general: 'Alguma coisa deu errado' });
        }
    })
}

exports.login = (req, res) => {
    const userData = {
        email: req.body.email,
        password: req.body.password
    }

    const { valid, errors } = validateLogin(userData);

    if(!valid) {
        return res.status(400).json(errors);
    }

    firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.status(200).json({ 
                status: 'Logado com sucesso',
                token
             })
        })
        .catch(err => {
            if(err.code == 'auth/user-not-found'){
                res.status(404).json({ message: 'O usuário não existe' });
            } else if(err.code === 'auth/wrong-password'){
                return res.status(400).json({ senha: 'A senha está incorreta' });
            } else {
                return res.status(500).json({ error: err.code });
            }
        })
}

exports.updateUserDetails = (req, res) => {
    const { userDetails, errors, valid } = reduceUserDetails(req.body);

    if(!valid) {
        return res.json(errors);
    }

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'As informações foram modificadas' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

//Get authenticated user data
exports.getAuthenticatedUser = (req, res) => {
    let userData = {};

    db.doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            userData.credentials = doc.data();
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

//Upload image
exports.uploadImage = (req, res) => {
    const path = require('path'); //default package installed in every node
    const os = require('os'); //igual
    const fs = require('fs'); //file system

    const busboy = new BusBoy({ headers: req.headers }); 

    let imageFileName;
    let imageToBeUploaded = {}; //Empty Object

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
       if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
           return res.status(400).json({ error: 'Wrong file type submitted' });
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
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
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
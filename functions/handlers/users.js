//User stuff
const { admin, db } = require('../util/admin');

const config = require('../util/config');
const firebase = require('firebase');

firebase.initializeApp(config);
//firebase.analytics();

//Validators
const { validateSignUp } = require('../util/validators');

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
    .catch(err => {
        console.error(err);
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
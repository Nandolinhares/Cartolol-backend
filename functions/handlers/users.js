const firebase = require('firebase');
const config = require('../util/config');

firebase.initializeApp(config);
//firebase.analytics();

//User stuff
const { admin, db } = require('../util/admin');

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
    }
    
    const { errors, valid } = validateSignUp(newUser);

    if(!valid) {
        return res.status(400).json(errors);
    } 
    
   
}
const { db } = require('./admin');

//Helper Functions
const isEmpty = (field) => {
    if(field.trim() === '') return true;
    else return false;
}
const isEmptyNumber = (field) => {
    if(field === 0) return true;
    else return false;
}
const isNegativeNumber = (field) => {
    if(field < 0) return true;
    else return false;
}
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(email.match(emailRegEx)) return true;
    else return false;
}

exports.validateSignUp = (newUser) => {
    let errors = {};

    //Validando campos de signup
    if(isEmpty(newUser.name)){
        errors.name = 'O campo nome não pode estar vazio';
    }
    if(isEmpty(newUser.email)){
        errors.email = 'O campo email não pode estar vazio';
    } else if(!isEmail(newUser.email)){
        errors.email = 'O email digitado não é válido';
    }
    if(isEmpty(newUser.password)) {
        errors.password = 'O campo senha não pode estar vazio';
    }
    if(isEmpty(newUser.confirmPassword)) {
        errors.confirmPassword = 'O campo confirmar senha não pode estar vazio';
    }
    if(newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = 'A senha deve ser a mesma nos dois campos';
    }
    if(isEmpty(newUser.handle)){
        errors.handle = 'O campo de username não pode estar vazio';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLogin = (userData) => {
    let errors = {};

    if(isEmpty(userData.email)) {
        errors.email = 'O campo de email não pode estar vazio';
    } else if(!isEmail(userData.email)){
        errors.email = 'O email não é válido';
    }
 
    if(isEmpty(userData.password)){
        errors.password = 'O campo de senha não pode estar vazio';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (userReq) => {
    //Verificar as informações
    const userDetails = {};
    let errors = {};

    if(!isEmpty(userReq.name)) {
        userDetails.name = userReq.name
    } else {
        errors.name = 'O campo nome não pode estar vazio';
    };

    return {
        userDetails,
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
}

exports.validatePlayers = (playerReq) => {
    let errors = {};

    if(isEmpty(playerReq.name)){
        errors.name = 'O campo de nome não pode ficar vazio';
    } 
    if(isEmpty(playerReq.position)){
        errors.position = 'O campo não pode ficar vazio';
    }
    if(isEmpty(playerReq.team)){
        errors.team = 'O campo de time não pode ficar vazio';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
}

exports.reducePlayerDetails = (playerReq) => {
    //Verificar as informações
    const playerDetails = {};
    let errors = {};

    if(!isEmpty(playerReq.name)) {
        playerDetails.name = playerReq.name
    } else {
        errors.name = 'O campo nome não pode estar vazio';
    };
    if(!isEmpty(playerReq.position)) {
        playerDetails.position = playerReq.position
    } else {
        errors.position = 'O campo nome não pode estar vazio';
    };
    if(!isEmpty(playerReq.team)) {
        playerDetails.team = playerReq.team
    } else {
        errors.team = 'O campo nome não pode estar vazio';
    };
    if(!isEmptyNumber(playerReq.price)) {
        playerDetails.price = playerReq.price
    } else {
        errors.name = 'O campo nome não pode estar vazio';
    };
    if(!isNegativeNumber(playerReq.points)) {
        playerDetails.points = playerReq.points
    } else {
        errors.points = 'O campo nome não pode estar vazio ou número negativo';
    };

    return {
        playerDetails,
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
}

exports.validateResetPassword = (emailReq) => {
    let errors = {};
    let email = {};

    if(isEmpty(emailReq.email)) {
        errors.email = 'O campo não pode ficar vazio';
    } else if(isEmail(emailReq.email)) {
        email.email = emailReq.email;
    } else {
        errors.email = 'Esse email não existe';
    }

    return {
        email,
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceLeagueDetails = (leagueReq) => {
    //Verificar as informações
    const leagueDetails = {};
    let errors = {};

    if(!isEmpty(leagueReq.name)) {
        leagueDetails.name = leagueReq.name
    } else {
        errors.name = 'O campo nome da liga não pode estar vazio';
    };

    return {
        leagueDetails,
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
}
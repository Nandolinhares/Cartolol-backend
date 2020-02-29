//Helper Functions
const isEmpty = (field) => {
    if(field.trim() === '') return true;
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
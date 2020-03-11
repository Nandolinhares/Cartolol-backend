const { admin, db } = require('./admin');

//Middleware
module.exports = (req, res, next) => {
    //Verificar se existe token no header
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1]; //Bearer é 0 e o token é 1
    } else {
        console.error('Token não encontrado');
        res.status(401).json({ message: 'Não autorizado' });
    }

    //Verificar se o token é válido
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get()
        })
        .then(user => {
            req.user.handle = user.docs[0].data().handle;  
            req.user.imageUrl = user.docs[0].data().imageUrl;
            req.user.administrator = user.docs[0].data().administrator;
            return next();
        })
        .catch(err => {
            return res.status(401).json({
                message: 'Token inválido',
                error: err.code
            })
        })
}
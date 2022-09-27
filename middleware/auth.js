const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        //Nous extrayons du header authorization le token (split bearer/token)
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET);
        //nous extrayons l'ID utilisateur de notre token et le rajoutons à l’objet Request afin que nos différentes routes puissent l’exploiter.
        const userId = decodedToken.userId;
        //stocker dans res.locals.userId
        res.locals.userId = userId;
        console.log(res.locals);
    next();
    } catch(error) {
        res.status(401).json({ error })
    }
};
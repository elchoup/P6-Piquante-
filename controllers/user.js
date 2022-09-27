const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userValidation = require('../validation/validation')

exports.signup = (req, res, next) => {
    const {body} = req
    const {error} = userValidation(body)
    if(error) return res.status(401).json(error.details[0].message);
    bcrypt.hash(body.password, 10)
        .then(hash => {
            const user = new User({
                email: body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect !' })
            } 
            bcrypt.compare(req.body.password, user.password).then(valid => {
                    if (!valid) {
                        res.status(401).json({ message: 'Identifiant ou mot de passe incorrect !' })
                    } else {
                        return res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                process.env.SECRET,
                                { expiresIn: '24h' }
                            )
                        });
                    }
                })
                .catch(error => res.status(400).json({ error }))
                
            
        })
        .catch(error => res.status(500).json({ error }));
};
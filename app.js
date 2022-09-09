const express = require ('express');
const mongoose = require ('mongoose');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const app = express();
require('dotenv').config();


//Authorisation pour faire des requètes provenant d'une autre origine.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    next();
  });



const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 150, // Limite chaque requète d'Ip à un total de 100
	standardHeaders: true, // Retourne les infos rateLimite dans l'header 'rateLimit'
	legacyHeaders: false, // Désactive le `X-RateLimit-*` headers
})

mongoose.connect(process.env.MONGO_URI,
    {   useNewUrlParser: true,
        useUnifiedTopology: true})
    .then(() => console.log('Connection à MongoDB réussi !'))
    .catch(() => console.log('Connection à MongoDB échouée !'));

app.use(express.json());
app.use(morgan('combined'));


app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(helmet());
app.use('/api', apiLimiter);
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);


module.exports = app;
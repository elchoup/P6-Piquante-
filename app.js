const express = require ('express');
const mongoose = require ('mongoose');
const path = require('path');
const app = express();

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');


mongoose.connect('mongodb+srv://elchoup:databasecluster@cluster0.tg0dtjw.mongodb.net/P6?retryWrites=true&w=majority',
    {   useNewUrlParser: true,
        useUnifiedTopology: true})
    .then(() => console.log('Connection à MongoDB réussi !'))
    .catch(() => console.log('Connection à MongoDB échouée !'));

app.use(express.json());

//Authorisation pour faire des requètes provenant d'une autre origine.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
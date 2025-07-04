const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const clientauth = require('../client/src/routes/auth.route');
const mobileRoutes = require('../mobile/src/routes');


const app = express();



app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// Routes
app.use('/api/auth',  clientauth);
const mobileRoutes = require('../mobile/src/routes');



module.exports = app;
require('dotenv').config();
hostname = process.env.HOSTNAME
port = process.env.PORT

const path = require('path');
const express = require('express');
const hbs = require('hbs');
const routes = require('./routes/routes.js');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.use('/', routes);

app.listen(port, hostname, function () {
    console.log(
        `Server is running at http://${hostname}:${port}`
    );
});

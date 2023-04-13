const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')
require('dotenv').config({ path: 'default.env' })

const http = require('http');

// Swagger needs
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger.json');
const basicAuth = require('express-basic-auth');

// Setting express
const app = express();

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
	origin: 'http://localhost:8080',
	credentials: true
}))

// Setting up the welcome message
require('./routes')(app);

/****************
 * SWAGGER
 ****************/
var swaggerUiOptions = {
	explorer: false,
	operationsSorter: 'alpha',
}

// Swagger basic Auth 
app.use('/doc', basicAuth({
	users: {
		'admin': 'admin'
	},
	challenge: true,
}), swaggerUi.serve, swaggerUi.setup(swaggerFile, swaggerUiOptions));

// Default message
app.get('/', (req, res) => res.status(200).send({
	message: 'Bienvenid@s, al servicio de autenticar clientes.',
}));

// Setting port
const port = parseInt(process.env.PORT, 10) || 3002;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

module.exports = app;
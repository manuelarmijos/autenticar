const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')
require('dotenv').config({ path: 'default.env' })
var amqp = require('amqplib/callback_api');
const conductor = require('controllers/autenticarConductor');

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

global.rabbit;

amqp.connect('amqp://admin:admin@64.226.112.105:5672', function (error0, connection) {
	if (error0) {
		console.log('ERROR NO SE PUDO CONECTARSE CON RABBIT')
		console.log(error0)
		throw error0;
	}
	connection.createChannel(function (error1, channel) {
		console.log('rabit fue conectado correctamente')
		if (error1) {
			console.log('Erro en la coneccioón a rabbit')
			console.log(error1)
			throw error1;
		}
		rabbit = channel;
		var queue = 'enviarEmit';
		var queue1 = 'asignarConductor';
		var msg = 'Hola manolo';

		rabbit.assertQueue(queue1, {
			// durable: false //En false si el servico de rabir se detiene por alguna razon se perderan los mensajes y las colas
			durable: true //En true si el servico de rabir se detiene por alguna razon los mensajes y las colas se guardan en memoria
		});
		rabbit.assertQueue(queue, {
			// durable: false //En false si el servico de rabir se detiene por alguna razon se perderan los mensajes y las colas
			durable: true //En true si el servico de rabir se detiene por alguna razon los mensajes y las colas se guardan en memoria
		});

		rabbit.consume(queue1, function (msg) {
			var secs = msg.content.toString().split('.').length - 1;
			console.log('Recibiendo mensaje de Solicitud')
			console.log(" Data recibida", msg.content.toString());
			conductor.buscarCondcutorLibre();
			setTimeout(function () {
				console.log(" [x] Done");
				rabbit.ack(msg); // ACK permite avisar a rabbit que el mensaje ya fue procesado y se puede eliminar
			}, 10000);
		}, {
			// noAck: true Una vez que llego el mensaje no se vuelve a notificar si pasa algo
			noAck: false // Recuperar mensajes perdidos si por A o B razones se desconecta automaticamente se vuelven a enviar
		});
	});

});

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
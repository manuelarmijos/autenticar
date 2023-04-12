// Controllers

const clienteController = require('../controllers/autenticarCliente');
const conductorController = require('../controllers/autenticarConductor');

module.exports = (app) => {

	app.get('/autenticar', (req, res) => res.status(200).send({
		message: '¡Esta es una buena señal! Nuestro Node.js está funcionando correctamente sobre el servicio autenticar ;)',
	}));

	app.post('/autenticar/cliente/autentica', clienteController.autenticar);
	app.post('/autenticar/conductor/autentica', conductorController.autenticar);

};
const Sequelize = require('sequelize');
const autenticarCliente = require('../models').cliente;
var jwt = require('jsonwebtoken');
var md5 = require('md5');

module.exports = {


	/**
	 * Find all users
	 * 
	 * Example: SELECT * FROM usuarios WHERE status = ?
	 * 
	 * Methoud: GET
	 * Headers: -
	 * Body: -
	 * 
	 * @param {*} req 
	 * @param {*} res 
	 */
	autenticar(req, res) {
		console.log('Dentro del recurso para autenticar cliente')
		console.log(req.body)
		console.log(process.env.SECRET)
		return autenticarCliente
			.findAll({
				attributes: ['id', 'nombre', 'apellido'],
				where: {
					usuario: req.body.usuario,
					password: md5(req.body.password + process.env.SECRET),
					habilitado: 1
				},
				limit: 1
			})
			.then(cliente => {
				console.log(cliente)
				if (cliente.length == 0)
					return res.status(200).send({
						en: -1,
						m: 'No se logró identificar al usuario ingresado'
					})
				jwt.sign({ cliente }, process.env.SECRETTOKEN, function (err, token) {
					if (err) {
						console.log(err)
						return res.status(200).send({
							en: -1,
							m: 'No se logró generar el token de seguridad'
						})
					}
					console.log(token);
					cliente[0].token = token;
					autenticarCliente.update({
						token: token,
					}, {
						where: {
							id: cliente[0].id,
						},
					})
						.then(solicitud => console.log('actualizado'))
						.catch(error => console.log('no actualizado'))
					return res.status(200).send({
						en: 1,
						t: token
					})
				});
			})
			.catch(error => res.status(400).send({
				en: -1,
				error: error
			}))
	}

}
const Sequelize = require('sequelize');
const autenticarConductor = require('../models').conductor;
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
        return autenticarConductor
            .findAll({
                attributes: ['id', 'nombre', 'apellido'],
                where: {
                    usuario: req.body.usuario,
                    password: md5(req.body.password + process.env.SECRET),
                    habilitado: 1
                },
                limit: 1
            })
            .then(conductor => {
                console.log(conductor)
                if(conductor.length == 0)
                    return res.status(200).send({
                        en: -1,
                        m: 'No se logró identificar al conductor ingresado'
                    })
                jwt.sign({ conductor }, process.env.SECRETTOKEN,  function(err, token) {
                    if(err) {
                        console.log(err)
                        return res.status(200).send({
                            en: -1,
                            m: 'No se logró generar el token de seguridad'
                        })
                    }
                    console.log(token);
                    conductor[0].token = token;
                    autenticarConductor.update({
                        token: token,
                    }, {
                        where: {
                            id: conductor[0].id,
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
                error
            }))
    }

}
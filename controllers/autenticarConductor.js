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
                if (conductor.length == 0)
                    return res.status(200).send({
                        en: -1,
                        m: 'No se logró identificar al conductor ingresado'
                    })
                jwt.sign({ conductor }, process.env.SECRETTOKEN, function (err, token) {
                    if (err) {
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
    },
    buscarCondcutorLibre(idCliente) {
        console.log('Buscado conductor disponible para asignar la carrera')
        autenticarConductor.findAll({
            attributes: ['id', 'nombre', 'apellido'],
            where: {
                habilitado: 1,
                estado: 1
            },
            limit: 1
        })
            .then(conductor => {
                // console.log(conductor)
                console.log(conductor.length)
                console.log(conductor[0])
                console.log(conductor[0].dataValues)
                console.log(conductor[0].dataValues.id)
                if (conductor && conductor.length > 0)
                    if (conductor[0].dataValues && conductor[0].dataValues.id) {
                        let info = {
                            en: 1,
                            id: conductor[0].dataValues.id,
                            nombre: conductor[0].dataValues.nombre,
                            apellido: conductor[0].dataValues.apellido,
                            idCliente: idCliente
                        }
                        var queue = 'enviarEmit';
                        console.log('Enviando la información del conductor')
                        rabbit.sendToQueue(queue, Buffer.from(JSON.stringify(info)), {
                            persistent: true
                        });
                        console.log('Mensaje enviado')
                        actualizarConductorEstado(conductor[0].dataValues.id);
                    } else {
                        var queue = 'enviarEmit';
                        console.log('Enviando la información del conductor')
                        rabbit.sendToQueue(queue, Buffer.from(JSON.stringify({ en: -1 })), {
                            persistent: true
                        });
                        console.log('Mensaje enviado')
                    }
            })
            .catch(error => {
                console.log(error)
                var queue = 'enviarEmit';
                console.log('Enviando la información del conductor')
                rabbit.sendToQueue(queue, Buffer.from(JSON.stringify({ en: -1 })), {
                    persistent: true
                });
                console.log('Mensaje enviado');
            })
    }

}

const actualizarConductorEstado = (idConductor) => {
    console.log('Cambiando el estado del conductor')
    autenticarConductor.update({ estado: 2 }, {
        where: {
            id: idConductor
        }
    })
        .then(conductor => {
            console.log(conductor)
        })
        .catch(error => {
            console.log(error)
        })
}
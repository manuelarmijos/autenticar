const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger.json'
const endpointsFiles = ['./routes/index.js']

const basicInformation = {
    info: {
        version: "1.0.0",
        title: "API - Node JS + Sequelize",
        description: "Web Services Documentation"
    },
}
swaggerAutogen(outputFile, endpointsFiles, basicInformation);
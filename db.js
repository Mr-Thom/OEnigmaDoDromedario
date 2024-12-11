const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://user:402Info@oenigmadodromedario.tja6b.mongodb.net/OEnigmaDoDromedario?retryWrites=true&w=majority&appName=OEnigmaDoDromedario")
    .then(() => {
        console.log("Conexão estabelecida com o banco!!!");
    })
    .catch(err => {
        console.log("Erro ao conectar com o banco...");
        console.log(err)
    })

module.exports = mongoose
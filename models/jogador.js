const {mongoose} = require("../db")

const jogadorSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    comentario: String,
    charadaFinal: String,
    pontuacao: String,
})

const Jogador = mongoose.model("Jogador", jogadorSchema)

module.exports = Jogador
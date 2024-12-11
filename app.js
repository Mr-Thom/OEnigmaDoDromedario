//Inicializacao Basica
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const Jogador = require("./models/jogador");
const path = require("path");

//Inicialização Gemini
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai"); //importa o modulo do Gemini
const genAI = new GoogleGenerativeAI("INSIRA_SUA_API_KEY_AQUI"); //Cria um objeto Gemini passando a chave de API
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    }
]
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: "Voce e um chatBot que cria Charadas. A sua missão e criar charadas e verificar se as respostas do usuario estao corretas. Voce deve sempre se comunicar em português brasileiro", safetySettings: safetySettings}); //Cria um modelo de IA
const chat = model.startChat(); //Cria um chatBot

//Configuracao
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//Variaveis para o Jogo
let pontuacaoFinal = 0
let respostaDaCharada = ""
let charadaFinal = ""

//Jogo
app.get("/game", async (req, res) => {
    const result = await chat.sendMessage("Sem repetir as charadas anteriores, elabore uma nova charada e separe a pergunta da resposta por três pontos (Ex: pergunta...resposta)");
    const charada = result.response.text().split("...");
    const pergunta = charada[0];
    const gabarito = charada[1];
    res.render("game", {pergunta: pergunta, gabarito: gabarito, pontuacao: pontuacaoFinal});
});

//Validar resposta
app.post("/game", async (req, res) => {
    const {pergunta, resposta, gabarito} = req.body;
    const result = await chat.sendMessage("A resposta da charada era =" + gabarito+ " | O usuario respondeu = " + resposta + " | Analise as duas respostas, ignorando artigos definidos e indefinidos. Se o usuario respondeu corretamente ou, pelo menos, remeteu a resposta correta, retorne apenas '1'. Caso tenha respondido errado ou, nem mesmo, remetido a resposta correta, reponda apenas '0'");
    if (result.response.text().includes("1")){
        pontuacaoFinal++
        res.redirect("/game");
    } else {
        respostaDaCharada = gabarito
        charadaFinal = pergunta
        res.redirect("/jogadores/new")
    }
});

//Index
app.get("/jogadores", async (req, res) => {
    const jogadores = await Jogador.find({});
    res.render("index", { jogadores: jogadores });
});

//Mostra o formulário de criacao
app.get("/jogadores/new", (req, res) => {
    const pontuacao = pontuacaoFinal
    const resposta = respostaDaCharada
    const pergunta = charadaFinal
    pontuacaoFinal = 0
    respostaDaCharada = ""
    charadaFinal = ""
    res.render("new", {resposta: resposta, pontuacao: pontuacao, pergunta: pergunta})
 });

// //Salva um jogador
app.post("/jogadores", async(req, res) => {
    const { nome, comentario, pergunta, pontuacao } = req.body;
    const jogador = new Jogador({nome: nome, comentario: comentario, charadaFinal: pergunta, pontuacao: pontuacao})
    await jogador.save()
    pontuacaoFinal = 0
    respostaDaCharada = ""
    res.redirect("/jogadores");
})

//Mostrar um jogador especifico
app.get("/jogadores/:id", async (req, res) => {
    const { id } = req.params;
    const jogador = await Jogador.findById(id)
    res.render("show", {jogador:jogador})
});

//Mostra uma formulario para editar um jogador
app.get("/jogadores/:id/edit", async (req, res) => {
    const { id } = req.params;
    const jogador = await Jogador.findById(id)
    res.render("edit", {jogador: jogador})
})

//Edita um jogador
app.patch("/jogadores/:id", async (req, res) => {
    const { id } = req.params;
    const { nome, comentario} = req.body;
    const jogador = {nome: nome, comentario: comentario}
    await Jogador.findByIdAndUpdate(id, jogador, {runValidators: true})
    res.redirect("/jogadores/" + id)
})

//Deleta um jogador
app.delete("/jogadores/:id", async (req, res) => {
    const { id } = req.params;
    await Jogador.findByIdAndDelete(id)
    res.redirect("/jogadores")
})

//botão jogar (cabecalho)
app.get("/game", (req, res) => {
    res.render("game");
});

 app.listen(3000, () => {
     console.log("Rodando na 3000");
 });
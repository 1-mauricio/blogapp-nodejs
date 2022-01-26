// carregando modulos
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose= require("mongoose");

//configurações
// body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//handlebars
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//mongoose
mongoose
    .connect("mongodb://localhost/blogapp")
    .then(() => console.log("conexao feita com sucesso"))
    .catch((err) => console.log("erro na conexao " + err))

// public
app.use(express.static(path.join(__dirname + "/public"))); //mostrando ao express que a pasta public guarda os arquivos estaticos

//rotas
app.use("/admin", admin); //estabelece prefixo para rotas

//outros
const PORT = 8000;
app.listen(PORT, () => {
    console.log("servidor rodando");
});

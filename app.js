// carregando modulos
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
//flash aparece apenas uma vez
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);

//configurações
//Sessão - passport - flash (importante seguir essa ordem)
app.use(
    session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//middleware
app.use((req, res, next) => {
    //variaveis globais
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    // passport cria automaticamente com os dados do usuario logado
    res.locals.user = req.user || null;
    next();
});

/* middleware
app.use((req,res,next) => {
    console.log("Oi eu sou um middleware")
    next()
})
*/

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
    .catch((err) => console.log("erro na conexao " + err));

// public
app.use(express.static(path.join(__dirname + "/public"))); //mostrando ao express que a pasta public guarda os arquivos estaticos

//rotas
app.get("/", (req, res) => {
    Postagem.find()
        .lean()
        .populate("categoria")
        .sort({ data: "desc" })
        .then((postagens) => {
            res.render("index", { postagens: postagens });
        })
        .catch((e) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/404");
        });
});

app.get("/404", (req, res) => {
    res.send("Erro 404!");
});

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug })
        .lean()
        .then((postagem) => {
            if (postagem) res.render("postagem/index", { postagem: postagem });
            else {
                req.flash("error_msg", "Esta postagem não existe");
                res.redirect("/");
            }
        })
        .catch((e) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        });
});

app.get("/categorias", (req, res) => {
    Categoria.find()
        .lean()
        .then((categorias) => {
            res.render("categorias/index", { categorias: categorias });
        })
        .catch((e) => {
            req.flash(
                "error_msg",
                "Houve um erro interno ao listar as categorias"
            );
            res.redirect("/");
        });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug })
        .lean()
        .then((categoria) => {
            if (categoria) {
                Postagem.find({ categoria: categoria._id })
                    .lean()
                    .then((postagens) => {
                        res.render("categorias/postagens", {
                            postagens: postagens,
                            categoria: categoria,
                        });
                    })
                    .catch((e) => {
                        req.flash(
                            "error_msg",
                            "Houve um erro interno ao listar os posts"
                        );
                        res.redirect("/");
                    });
            } else {
                req.flash("error_msg", "Essa categoria não existe");
                res.redirect("/");
            }
        })
        .catch((e) => {
            req.flash(
                "error_msg",
                "Houve um erro interno ao listar as categorias"
            );
            res.redirect("/");
        });
});

app.use("/admin", admin); //estabelece prefixo para rotas
app.use("/usuario", usuarios);

//outros
const PORT = 8000;
app.listen(PORT, () => {
    console.log("servidor rodando");
});

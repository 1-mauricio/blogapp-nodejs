const express = require("express");
const { appendFile, rmSync } = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require('passport')


router.get("/registro", (req, res) => {
    res.render("usuario/registro");
});

router.post("/registro", (req, res) => {
    let erros = [];

    if (
        !req.body.nome ||
        typeof req.body.nome == undefined ||
        req.body.nome == null
    )
        erros.push({ texto: "Nome inválido" });

    if (
        !req.body.email ||
        typeof req.body.email == undefined ||
        req.body.email == null
    )
        erros.push({ texto: "email inválido" });

    if (
        !req.body.senha ||
        typeof req.body.senha == undefined ||
        req.body.senha == null
    )
        erros.push({ texto: "senha inválida" });

    if (req.body.senha.length < 4) erros.push({ texto: "senha muito curta" });

    if (req.body.senha != req.body.senha2)
        erros.push({ texto: "As senhas são diferentes, tente novamente" });

    if (erros.length > 0) {
        res.render("usuario/registro", { erros: erros });
    } else {
        Usuario.findOne({ email: req.body.email })
            .then((usuario) => {
                if (usuario) {
                    req.flash(
                        "error_msg",
                        "Já existe uma conta com esse email cadastrada no nosso sistema"
                    );
                    res.redirect("/usuario/registro");
                } else {
                    const novoUsuario = new Usuario({
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha
                    });

                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                            if (erro) {
                                req.flash(
                                    "error_msg",
                                    "Houve um erro durante o salvamento do usuário"
                                );
                                res.redirect("/");
                            } else {
                                novoUsuario.senha = hash;

                                novoUsuario.save()
                                    .then(() => {
                                        req.flash(
                                            "success_msg",
                                            "Usuário criado com sucesso"
                                        );
                                        res.redirect("/");
                                    })
                                    .catch((e) => {
                                        req.flash(
                                            "error_msg",
                                            "Houve um erro ao criar o usuario. Tente novamente"
                                        );
                                        res.redirect("/usuario/registro");
                                    })
                            }
                        });
                    });
                }
            })
            .catch((e) => {
                req.flash("error_msg", "Houve um erro interno");
                res.redirect("/");
            });
    }
});

router.get('/login', (req, res) => {
    res.render("usuario/login")
})

router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuario/login",
        failureFlash: true
    }) (req, res, next)
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash("success_msg", "deslogado com sucesso")
    res.redirect("/")
})

module.exports = router;

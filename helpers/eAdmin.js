module.exports = {
    eAdmin: (req, res, next) => {
        if(req.isAuthenticated() && req.user.eAdmin == 1) {
            return next()
        }

        req.flash("error_msg", "Você precisa ser um admin para entrar aqui")
        res.redirect("/")
    },

    logado: (req, res, next) => {
        if(req.isAuthenticated()) {
            return next()
        }

        req.flash("error_msg", "Você deve estar logado para entrar aqui")
        res.redirect("/")
    }
}
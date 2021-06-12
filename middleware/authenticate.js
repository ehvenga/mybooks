middlewareObj = {};

// check if looged in using session object
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.session.isLoggedIn == true) {
        next()
    }
    else
    res.status(401).render('signin', {alert: 'You must be logged in to do that'})
}

module.exports = middlewareObj;
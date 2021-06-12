const router = require('express').Router()
const middleware = require('../middleware/authenticate')
const checkoutController = require('../controllers/checkout')

// routes for all everything checkout related
router.post('/cart', middleware.isLoggedIn, checkoutController.checkoutFromCart)
router.post('/buynow', middleware.isLoggedIn, checkoutController.checkoutFromBuyNow)
router.post('/payment', middleware.isLoggedIn, checkoutController.payment)

module.exports = router
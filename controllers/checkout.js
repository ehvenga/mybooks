// import packages
const UserModel = require('../models/User')
const BookModel = require('../models/Book')

// get checkout page from cart
exports.checkoutFromCart = async (req, res) => {
    try {
        // fetch user data
        const fetchUser = await UserModel.findById(req.session.userid)
        let data = {
            name: fetchUser.name, 
            email: fetchUser.email,
            amount: req.body.amount,
            contact: fetchUser.contact
    }
    return res.status(200).render('checkout', data)
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }
}

// checkout page from buy now button
exports.checkoutFromBuyNow = async (req, res) => {
    try {
        // fetch user and book data
        const fetchBook = await BookModel.findById(req.body.bookid)
        const fetchUser = await UserModel.findById(req.session.userid)
        let data = {
            name: fetchUser.name, 
            email: fetchUser.email,
            amount: fetchBook.price,
            contact: fetchUser.contact,
            address: fetchUser.address,
            pincode: fetchUser.pincode
    }
    return res.status(200).render('checkout', data)
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }
}

// payment page
exports.payment = async (req, res) => {
    try {
        data = req.body
        await UserModel.updateOne(
            {_id: req.session.userid},
            {
                address: req.body.address,
                contact: req.body.contact,
                pincode: req.body.pincode
            }
        )
        return res.render('payment', data)
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }
}
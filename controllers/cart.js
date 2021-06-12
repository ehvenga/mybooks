// import packages
const UserModel = require('../models/User')

// cart details
exports.getCart = async (req, res) => {
    try {
        // fetch books in cart and populate with book details
        const fetchUser = await UserModel.findById(req.session.userid).populate('cart').lean()
        let data = {
            books: fetchUser.cart,
            items: 0,
            total: 0
        }
        // fetch quantity of books in cart
        let quantity= fetchUser.quantity

        // map quantity of books into single object
        if (data.books) {
            data.books = data.books.map((item, index) => {
                item.qty = quantity[index]
                return item
            })

            // loop over book objects to calculate total items of books and subtotal of price
            for (item in data.books) {
                data.items += data.books[item].qty
                data.total += data.books[item].qty * data.books[item].price
            }
        }
        return res.status(200).render('cart', {data})
    } catch (error) {
        console.log(error)
        return res.status(400).render('cart', {alert: 'Internal Error: Please Try Again Later'})
    }
}

// clear cart and redirect to cart
exports.clearCart = async (req, res) => {
    try {
        // use user id to clear cart array in user document
        await UserModel.updateOne({_id: req.session.userid},{$unset: {cart:1, quantity:1}},{multi:true})
        return res.status(202).redirect('/cart')
    } catch (error) {
        console.log(error)
        return res.status(400).render('cart', {alert: 'Internal Error: Please Try Again Later'})
    }
}

// add to cart and redirect to cart
exports.addToCart = async (req, res) => {
    try {
        // fetch user document
        const fetchUser = await UserModel.findById(req.session.userid)
        // loop over cart array to check if book id already in cart
        for (index in fetchUser.cart) {
            if (req.body.bookid == fetchUser.cart[index]) {
                return res.status(406).redirect('/cart')
            }
        }

        // add book id to user cart array
        await UserModel.findByIdAndUpdate(
            req.session.userid,
            {
                $push: {
                    "cart": req.body.bookid,
                    "quantity": req.body.quantity
                }
            }
        )
    } catch (error) {
        console.log(error)
        return res.status(400).render('cart', {alert: 'Internal Error: Please Try Again Later'})
    }
    return res.status(202).redirect('/cart')
}

// increase quantity of book and redirect to cart
exports.addItemCounter = async (req, res) => {
    try {
        // fetch user document and clear cart array
        const fetchUser = await UserModel.findById(req.session.userid).lean()
        await UserModel.updateOne({_id: req.session.userid},{$unset: {cart:1, quantity:1}},{multi:true})

        // intialize new arrays for updating values quantity
        let cart = fetchUser.cart
        let quantity = fetchUser.quantity
        let newCart = []
        let newQuantity = []

        // loop over cart to increase quantity by 1 in quantity array
        for (index in cart) {
            // check if book id matches to only apply to selected book
            if (req.body.bookid == cart[index]) {
                quantity[index] += 1
            }
            // push data new cart and new quantity arrays
            newCart.push(cart[index])
            newQuantity.push(quantity[index])

            try {
                // push cart values into empty cart array
                await UserModel.findByIdAndUpdate(
                    req.session.userid,
                    {
                        $push: {
                            "cart": newCart[index],
                            "quantity": newQuantity[index]
                        }
                    }
                )
            } catch (error) {
                console.log(error)
                return res.status(400).render('cart', {alert: 'Internal Error: Please Try Again Later'})
            }

        }
        return res.status(201).redirect('/cart')

    } catch (error) {
        console.log(error)
        return res.status(400).render('cart', {alert: 'Internal Error: Please Try Again Later'})
    }
}

// reduce quantity of book and redirect to cart
exports.reduceItemCount = async (req, res) => {
    try {
        // fetch user document and clear cart array
        const fetchUser = await UserModel.findById(req.session.userid).lean()
        await UserModel.updateOne({_id: req.session.userid},{$unset: {cart:1, quantity:1}},{multi:true})

        // intialize new arrays for updating values quantity
        let cart = fetchUser.cart
        let quantity = fetchUser.quantity
        let newCart = []
        let newQuantity = []

        // loop over cart to decrease quantity by 1 in quantity array
        for (index in cart) {
            // check if book id matches to only apply to selected book
            if (req.body.bookid == cart[index]) {
                quantity[index] -= 1
            }
            // check if quantity is above zero, if below zero, do not add bookid to cart
            if (quantity[index] > 0) {
                newCart.push(cart[index])
                newQuantity.push(quantity[index])
            }
        }

        // loop over new cart array to add to user cart array
        for (index in newCart) {
            try {
                // push cart values into empty cart array
                await UserModel.findByIdAndUpdate(
                    req.session.userid,
                    {
                        $push: {
                            "cart": newCart[index],
                            "quantity": newQuantity[index]
                        }
                    }
                )
            } catch (error) {
                console.log(error)
                return res.status(400).render('cart', {alert: 'Internal Error: Please Try Again Later'})
            }
        }
        return res.status(201).redirect('/cart')

    } catch (error) {
        console.log(error)
        return res.status(400).render('cart', {alert: 'Internal Error: Please Try Again Later'})
    }
}
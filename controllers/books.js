// import packages and models
const cloudinary = require('cloudinary').v2
const {Base64} = require('js-base64')
const ReviewModel = require('../models/Review')
const BookModel = require('../models/Book')

// import keys and configure cloudinary
const {API_SECRET, CLOUD_NAME, API_KEY} = process.env  
cloudinary.config({ 
    cloud_name: CLOUD_NAME, 
    api_key: API_KEY, 
    api_secret: API_SECRET 
})

// home page
exports.getHome = async (req, res) => {
    try {
        // retrive all books and books' data for home page
        const data = {books:[]}
        const fetchBooks = await BookModel.find({}).lean()
        for (const book in fetchBooks) {
                data.books.push(fetchBooks[book])
        }
        return res.status(200).render('home', data)
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }
}

// about page
exports.getAbout = (req, res) => {
    res.render('about')
}

// search results page
exports.getSearchResults = async (req, res) => {
    try {
        // retrive results of book collection using four search fields
        const data = {books:[]}
        const fetchBooks = await BookModel.find(
            {$or:[
                {"title" : { '$regex' : req.query.search, '$options' : 'i'}},
                {"author" : { '$regex' : req.query.search, '$options' : 'i'}},
                {"isbn" : { '$regex' : req.query.search, '$options' : 'i'}},
                {"genre" : { '$regex' : req.query.search, '$options' : 'i'}}
            ]}
        ).lean()
        
        // loop to add books into book data
        for (let index in fetchBooks) {
            data.books.push(fetchBooks[index])
        }
        
        // if no results result page
        if (!data.books[0]) {
            return res.render('search', {empty: 'No Search Results: Try Again'})
        }

        return res.status(202).render('search', data)
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }
}

// book listing
exports.getBookListing = async (req, res) => {
    try {
        // fetch book data from book collection
        const fetchBook = await BookModel.findById(req.params.bookid).populate('reviews').lean()

        // if no reviews in reviews array
        if (!fetchBook.reviews[0]) {
            return res.status(200).render('listing', {
                fetchBook,
                empty: "No Reviews: Be the first one to leave a Review"
            })
        }

        let data = {books: fetchBook.reviews}
        return res.status(200).render('listing', {
            data: data,
            fetchBook
        })

    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'}) 
    }
}

// review form page
exports.getReviewPage = (req, res) => {
    res.status(200).render('review', {
        bookid: req.params.bookid
    })
}

// post review
exports.postReview = async (req, res) => {
    let savedReviewDoc = {}
    const {bookid} = req.body
    console.log(bookid)

    // data to be passed when creating new document
    let reviewData = {
        reviewTitle: req.body.reviewTitle,
        review: req.body.review,
        rating: req.body.rating,
        reviewer: {
            id: req.session.userid, 
            name: req.session.name
        }
    }

    try {
        // create new review document
        const newReviewDoc = new ReviewModel(reviewData)
        savedReviewDoc = await newReviewDoc.save()
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }

    try {
        // update book document with new review
        await BookModel.findByIdAndUpdate(
            bookid,
            {
                $push: {"reviews": savedReviewDoc._id, "reviewed": req.session.userid}
            }
        )
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }

    res.status(201).redirect(`/listing/${bookid}`)
}

// book upload form page
exports.getBookUpload = (req, res) => {
    res.status(200).render('upload')
}

// post book
exports.uploadBook = async (req, res) => {

    // to use body data to create new book document
    try {
        // encode to base64 and upload to cloudinary
        const base64String = Base64.encode(req.files.cover.data)
        const uploadResult = await cloudinary.uploader.upload(`data:${req.files.cover.mimetype};base64,${base64String}`,{
            folder: "mybooks/"
        })
        
        // book data to be used when creating new book document
        let bookData = {
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            description: req.body.description,
            price: req.body.price,
            inventory: req.body.inventory,
            isbn: req.body.isbn,
            cover: uploadResult.url,
            uploader: {id: req.session.userid, name: req.session.name},
            reviews: [],
            reviewed: []
        }

        // create and save new book document
        const newBookDoc = new BookModel(bookData)
        const savedBookDoc = await newBookDoc.save()
        return res.status(201).redirect(`listing/${savedBookDoc._id}`)

    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'})
    }

}
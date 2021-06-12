// import packages and models
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary').v2
const {Base64} = require('js-base64')
const UserModel = require('../models/User')

// import keys and configure cloudinary 
const {API_SECRET, CLOUD_NAME, API_KEY} = process.env  
cloudinary.config({ 
    cloud_name: CLOUD_NAME, 
    api_key: API_KEY, 
    api_secret: API_SECRET 
})

// sign in page
exports.getSignIn = (req, res) => {
    res.render('signin')
}

// post signup 
exports.userSignUp = async (req, res) => {
    // assiging values to variables from body
    const {name, email, password} = req.body

    try {
        // using bcrypt to generate hashed passcode for secure storage
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        passcode = hashedPassword
    } catch (error) {
        console.log(error)
        return res.status(400).render('signin', {alert: 'Internal Error: User not created'})
    }
    // creating data structure suitable for creating new mongoose document
    userData = {
        name,
        email,
        passcode,
    }

    try {
        const newUserDoc = new UserModel(userData)
        const savedUserDoc = await newUserDoc.save()
        // setting session values to indicate server has authenticated user
        req.session.isLoggedIn = true
        req.session.userid = savedUserDoc._id
        req.session.name = savedUserDoc.name
        res.status(201).redirect('/profile')
    } catch (error) {
        const emailExists = await UserModel.findOne({ email: req.body.email })
        if (emailExists) {
            return res.status(400).render("signin", {alert: "Error: Email Already Exists"});
        }
        console.log(error)
        return res.status(400).render('signin', {alert: 'Internal Error: User not created'})
    }
} 

// post sign in 
exports.userSignIn = async (req, res) => {
    
    const {email, password} = req.body

    try {
        const returnUser = await UserModel.findOne({'email':`${email}`})
        if (returnUser != null){
            const isMatching = await bcrypt.compare(password, returnUser.passcode)
            if (isMatching) {
                req.session.isLoggedIn = true
                req.session.userid = returnUser._id
                req.session.name = returnUser.name
                res.status(202).redirect('/profile')
            }
            else {
                console.log('Credentials Not Matching')
                return res.status(400).render('signin', {alert: 'Wrong Password'})
            }
        }
        else{
            console.log('Email Not Found')
            return res.status(400).render('signin', {alert: 'Email not an existing user'})
        }
    } catch (error) {
        console.log(error)
        return res.status(400).render('signin', {alert: 'Error: Please Try Again'})
    }
}

// for logging out
exports.userLogout = (req, res) => {
    // clear session cookie on logout
    res.status(202).clearCookie('connect.sid').redirect('/')
    console.log('Logout Success')
}

// ownprofile with edit, delete and add books button
exports.getOwnProfile = async (req, res) => {
    // to fetch user if self using '/profile' route
    try {
        const fetchUser = await UserModel.findById(req.session.userid)
        // adding ownprofile value to render elements visible to own profile
        fetchUser.ownprofile = true
        res.status(200).render('profile', fetchUser)
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'}) 
    }
}

// other user's page, no own user elements
exports.getOtherUser = async (req, res) => {
    // to fetch users who are not self using '/user/:userid' route
    try {
        const fetchUser = await UserModel.findById(req.params.userid)
        if (req.session.userid == req.params.userid) {
            return res.status(200).redirect('/profile')
        }
        return res.render('profile', fetchUser)
    } catch (error) {
        console.log(error)
        return res.status(400).render('error', {alert: 'Internal Error: Please Try Again Later'}) 
    }
}

// edit user form and prefill with existing data
exports.getEditUserDetails = async (req, res) => {
    // fetch existing user details and show in form
    try {
        const fetchUser = await UserModel.findById(req.session.userid).lean()
        return res.status(200).render('editprofile', fetchUser)
    } catch (error) {
        console.log(error)
        return res.render('profile', {alert: 'Error: Please try again later'})
    }
    
}

// edited user details
exports.updateUserDetails = async (req, res) => {
    const {name,email,contact,address,pincode} = req.body

    try {
        // updating user details before checking for upload file
        await UserModel.updateOne({_id: req.session.userid},
            {   
                name: name,
                email: email,
                contact: contact,
                address: address,
                pincode: pincode
            })

        // if upload file exists then update photo url
        if (req.files) {
            const base64String = Base64.encode(req.files.photo.data)
            const uploadResult = await cloudinary.uploader.upload(`data:${req.files.photo.mimetype};base64,${base64String}`,{
                folder: "mybooks/"
            })
            await UserModel.updateOne({_id: req.session.userid},
                {   
                    photo: uploadResult.url
                })
        }
        return res.status(202).redirect('/profile')

    } catch (error) {
        console.log(error)
        return res.status(400).render('signin', {alert: 'Internal Error: User not created'})
    }
}
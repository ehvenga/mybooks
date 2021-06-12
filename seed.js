const UserModel = require("./models/User")
const BookModel = require("./models/Book")
const ReviewModel = require("./models/Review")

async function seedDB(){
    await UserModel.deleteMany({})
    await BookModel.deleteMany({})
    await ReviewModel.deleteMany({})
}


module.exports = {seedDB}
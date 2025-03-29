const mongoose = require('mongoose');

//function mongodb database connection
const connectDb =async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to database ${mongoose.connection.host}`.bgCyan)  
    } catch (error) {
        console.log("DB error",error)
    }
}


module.exports = connectDb;
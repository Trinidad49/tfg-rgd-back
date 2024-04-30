const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://0.0.0.0:27017/TFG");

// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
const Loginschema = new mongoose.Schema({
    email: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// collection part
const collection = new mongoose.model("user", Loginschema);

module.exports = collection;
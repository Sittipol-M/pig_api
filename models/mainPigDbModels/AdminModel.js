const mongoose = require("mongoose");

adminSchema = mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  sex:{
    type:String
  }
});

module.exports = adminSchema;

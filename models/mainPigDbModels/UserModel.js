const mongoose = require("mongoose");

// userOwnerSchema = mongoose.Schema({
//   username: {
//     type: String,
//   },
//   password: {
//     type: String,
//   },
//   name: {
//     type: String,
//   },
//   surname: {
//     type: String,
//   },
//   company: {
//     type: String,
//   },
//   position: {
//     type: String,
//   },
// });

userOwnerSchema = mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  company: {
    type: String,
  },
});

module.exports = userOwnerSchema;

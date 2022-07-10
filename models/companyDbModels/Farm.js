const mongoose = require("mongoose");

farmSchema = mongoose.Schema({
  farm_name: {
    type: String,
  },
});

module.exports = farmSchema;

const mongoose = require("mongoose");

companySchema = mongoose.Schema({
  company_name: {
    type: String,
  },
});

module.exports = companySchema;

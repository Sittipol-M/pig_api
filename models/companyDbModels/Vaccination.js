const mongoose = require("mongoose");
vaccinationSchema = mongoose.Schema(
  {
    vaccine_lot_code: {
      type: String,
    },
    vaccination_date: {
      type: Date,
    },
  }
);
module.exports = vaccinationSchema;

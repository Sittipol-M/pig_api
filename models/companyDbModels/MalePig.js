const mongoose = require("mongoose");
const vaccinationSchema = require("./Vaccination");

MaleSpermSchema = mongoose.Schema({
  date_collect_sperm: {
    type: Date,
  },
  companyUser_collect_sperm: {
    type: mongoose.ObjectId,
  },
});
module.exports = MaleSpermSchema;

MalePigSchema = mongoose.Schema({
  pig_code: {
    type: String,
  },
  rfid_code: {
    type: String,
  },
  sex: {
    type: String,
  },
  farm_id: {
    type: mongoose.ObjectId,
  },
  unit_code: {
    type: String,
  },
  block_code: {
    type: String,
  },
  vaccinations: [vaccinationSchema],
  sperms: [MaleSpermSchema],
});

module.exports = MalePigSchema;

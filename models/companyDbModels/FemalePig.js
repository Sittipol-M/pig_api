const mongoose = require("mongoose");
const vaccinationSchema = require("./Vaccination");
const breedSchema = require("./Breed");
FemalePigSchema = mongoose.Schema({
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
  breeds: [breedSchema],
});

module.exports = FemalePigSchema;

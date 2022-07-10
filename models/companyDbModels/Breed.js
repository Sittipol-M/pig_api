const mongoose = require("mongoose");

NewBornSchema = mongoose.Schema(
  {
    pig_alive: {
      type: Number,
    },
    pig_death: {
      type: Number,
    },
    born_date: {
      type: Date,
    },
    sum_weight_kg: {
      type: Number,
    },
    wean_date: {
      type: Date,
    },
  },
  {
    _id: false,
  }
);

BreedSchema = mongoose.Schema({
  breed_date: {
    type: Date,
  },
  sperm_code: {
    type: String,
  },
  companyUser_breeder_id: {
    type: mongoose.ObjectId,
  },
  new_born: NewBornSchema,
});

module.exports = BreedSchema;

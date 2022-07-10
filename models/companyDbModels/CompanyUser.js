const mongoose = require("mongoose");
const farmSchema = require("./Farm");
farmPermissionSchema = mongoose.Schema(
  {
    farm_id: {
      type: mongoose.ObjectId,
    },
    farm_name: {
      type: String,
    },
    permission: {
      type: Boolean,
    },
  },
  {
    _id: false,
  }
);

CompanyUserSchema = mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
  },
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  position: {
    type: String,
  },
  farm_permissions: [farmPermissionSchema],
});

module.exports = CompanyUserSchema;

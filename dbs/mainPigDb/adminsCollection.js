const mongoose = require("mongoose");
const dbUri = process.env.LOCAL_MONGODB;
const onlineDbUriFirst = process.env.ONLINE_MONGODB_FIRST;
const onlineDbUriSecond = process.env.ONLINE_MONGODB_SECOND;

exports.admin = () => {
  const adminSchema = require("../../models/mainPigDbModels/AdminModel");
  const adminDb = mongoose.createConnection(onlineDbUriFirst + "MainPigDB" + onlineDbUriSecond, { useNewUrlParser: true });
  return adminDb.model("Admin", adminSchema);
};

// exports.admin = () => {
//     const adminSchema = require("../models/AdminModel");
//     const adminDb = mongoose.createConnection(onlineDbUriFirst + "admins" + onlineDbUriSecond, { useNewUrlParser: true });
//     return adminDb.model("Admin", adminSchema);
//   };
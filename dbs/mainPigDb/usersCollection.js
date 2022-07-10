const mongoose = require("mongoose");
const dbUri = process.env.LOCAL_MONGODB;
const onlineDbUriFirst = process.env.ONLINE_MONGODB_FIRST;
const onlineDbUriSecond = process.env.ONLINE_MONGODB_SECOND;

exports.user = () => {
  const userSchema = require("../../models/mainPigDbModels/UserModel");
  const userDb = mongoose.createConnection(onlineDbUriFirst + "MainPigDB" + onlineDbUriSecond, { useNewUrlParser: true });
  return userDb.model("User", userSchema);
};

const mongoose = require("mongoose");
const dbUri = process.env.LOCAL_MONGODB;
const onlineDbUriFirst = process.env.ONLINE_MONGODB_FIRST;
const onlineDbUriSecond = process.env.ONLINE_MONGODB_SECOND;

exports.company = () => {
  const companySchema = require("../../models/mainPigDbModels/CompanyModel");
  const companyDb = mongoose.createConnection(onlineDbUriFirst + "MainPigDB" + onlineDbUriSecond, {
    useNewUrlParser: true,
  });
  return companyDb.model("Companies", companySchema);
};

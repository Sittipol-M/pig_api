const mongoose = require("mongoose");
const dbUri = process.env.LOCAL_MONGODB;
const onlineDbUriFirst = process.env.ONLINE_MONGODB_FIRST;
const onlineDbUriSecond = process.env.ONLINE_MONGODB_SECOND;
const companyUserSchema = require("../../models/companyDbModels/CompanyUser");

exports.companyUser = (company) => {
  const companyDb = mongoose.createConnection(onlineDbUriFirst + company + "DB" + onlineDbUriSecond, {
    useNewUrlParser: true,
  });

  return companyDb.model("CompanyUser", companyUserSchema);
};

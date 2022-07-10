const mongoose = require("mongoose");
const dbUri = process.env.LOCAL_MONGODB;
const onlineDbUriFirst = process.env.ONLINE_MONGODB_FIRST;
const onlineDbUriSecond = process.env.ONLINE_MONGODB_SECOND;
const farmSchema = require("../../models/companyDbModels/Farm");
exports.farm = (company) => {
  const companyDb = mongoose.createConnection(onlineDbUriFirst + company + "DB" + onlineDbUriSecond, {
    useNewUrlParser: true,
  });
  return companyDb.model("Farm", farmSchema);
};

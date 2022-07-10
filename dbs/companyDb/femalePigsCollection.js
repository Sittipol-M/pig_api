const mongoose = require("mongoose");
const dbUri = process.env.LOCAL_MONGODB;
const onlineDbUriFirst = process.env.ONLINE_MONGODB_FIRST;
const onlineDbUriSecond = process.env.ONLINE_MONGODB_SECOND;

const femalePigSchema = require("../../models/companyDbModels/FemalePig");

exports.femalePig = (company) => {
  const companyDb = mongoose.createConnection(onlineDbUriFirst + company + "DB" + onlineDbUriSecond, {
    useNewUrlParser: true,
  });
  return companyDb.model("femalepig", femalePigSchema);
};

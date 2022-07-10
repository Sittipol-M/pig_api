//////////import send response//////////
const { sendResponse, sendErrorResponse, sendValidationErrorResponse } = require("../../sendResponse/sendResponse");

/////////famale pig and male pig section//////////
//-> female pig and male pig mongoose model
const { malePig } = require("../../dbs/companyDb/malePigsCollection");
const { femalePig } = require("../../dbs/companyDb/femalePigsCollection");

//////////company user and user section//////////
//-> company user mongoose model
const { companyUser } = require("../../dbs/companyDb/companyUsersCollection");

//////////sperm section//////////
// //-> sperm mongoose model
// const { sperm } = require("../../dbs/companyDb/spermscollection");

/////////mongoose//////////
var ObjectId = require("mongodb").ObjectId;

//-> validation
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.newPig = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for use to find pig
  const requestBody = req.body;
  const newPigCode = requestBody.pig_code; //for create newPig's pig_code
  const newRfidCode = requestBody.rfid_code; //for create newPig's rfid_code
  const newPigSex = requestBody.sex; //for create newPig's sex
  //if not create with specify block (block_0000 = no block)
  let newBlockCode;
  !req.body.block_code ? (newBlockCode = "block_0000") : (newBlockCode = req.body.block_code);
  //if not create with specify unit (unit_0000 = no block)
  let newUnitCode;
  !req.body.unit_code ? (newUnitCode = "unit_0000") : (newUnitCode = req.body.unit_code);
  //block_0000 ,unit_0000 => Pig does not have current block or unit
  const requestPig = {
    pig_code: newPigCode,
    rfid_code: newRfidCode,
    sex: newPigSex,
    farm_id: selectedFarmId,
    block_code: newBlockCode,
    unit_code: newUnitCode,
  };

  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //check validation
    const PigSchema = Joi.object({
      pig_code: Joi.string().alphanum().required(),
      rfid_code: Joi.string().alphanum().required(),
      sex: Joi.string().valid("male", "female").required(),
      farm_id: Joi.objectId().required(),
      unit_code: Joi.string()
        .lowercase()
        .pattern(new RegExp(/^unit_+[0-9]+[0-9]+[0-9]+[0-9]$/))
        .min(9)
        .max(9)
        .required(),
      block_code: Joi.string()
        .lowercase()
        .pattern(new RegExp(/^block_+[0-9]+[0-9]+[0-9]+[0-9]$/))
        .min(10)
        .max(10)
        .required(),
    });
    const { error } = PigSchema.validate(requestPig);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial male pig mongoose object
    const MalePig = await malePig(selectedCompany);
    //initial female pig mongoose object
    const FemalePig = await femalePig(selectedCompany);

    //check if pig is existed
    const filter = { $or: [{ pig_code: newPigCode }, { rfid_code: newRfidCode }] };
    let foundPig = null;
    !foundPig ? (foundPig = await MalePig.findOne(filter)) : null;
    !foundPig ? (foundPig = await FemalePig.findOne(filter)) : null;
    if (foundPig) {
      return sendResponse(res, false, "Pig is existed", "PigExisted", null);
    }

    //save newpig
    let newPig;
    newPigSex === "male" ? (newPig = new MalePig(requestPig)) : null;
    newPigSex === "female" ? (newPig = new FemalePig(requestPig)) : null;
    const savedPig = await newPig.save();
    return sendResponse(res, true, "Pig was created successful", null, savedPig);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getPigs = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for use to find pig
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial male pig mongoose object
    const MalePig = await malePig(selectedCompany);
    //initial female pig mongoose object
    const FemalePig = await femalePig(selectedCompany);

    //find Pigs
    let foundPigs = null;
    const filter = { farm_id: selectedFarmId };
    foundPigs = foundPigs.concat(await MalePig.find(filter, { __v: 0 }));
    foundPigs = foundPigs.concat(await FemalePig.find(filter, { __v: 0 }));
    if (foundPigs.length === 0) {
      return sendResponse(res, false, "Pigs was not found", "PigsNotFound", null);
    }
    return sendResponse(res, true, "Pigs was found", null, foundPigs);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

exports.deletePigs = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for use to delete pigs
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial male pig mongoose object
    const MalePig = await malePig(selectedCompany);
    //initial female pig mongoose object
    const FemalePig = await femalePig(selectedCompany);

    //delete pigs
    const filter = { farm_id: selectedFarmId };
    let deletedCount = 0;
    deletedCount = deletedCount + (await MalePig.deleteMany(filter)).deletedCount;
    deletedCount = deletedCount + (await FemalePig.deleteMany(filter)).deletedCount;
    //check if pigs is existed
    if (deletedCount === 0) {
      return sendResponse(res, false, "Pigs was not found", "PigsNotFound", null);
    }
    return sendResponse(res, true, deletedCount + " pigs was deleted successful", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getPigWithRfidCode = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for use to delete pigs
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial male pig mongoose object
    const MalePig = await malePig(selectedCompany);
    //initial female pig mongoose object
    const FemalePig = await femalePig(selectedCompany);

    //find pig
    const filter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    let foundPig = null;
    !foundPig ? (foundPig = await MalePig.findOne(filter, { __v: 0 })) : null;
    !foundPig ? (foundPig = await FemalePig.findOne(filter, { __v: 0 })) : null;

    //check if pig is not existed
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }
    return sendResponse(res, true, "Pig was found", null, foundPig);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

exports.editPig = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for use to delete pigs
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  const requestBody = req.body;
  const updatePigCode = requestBody.pig_code;
  const updatePigRfid = requestBody.rfid_code;
  const updateBlockCode = requestBody.block_code;
  const updateUnitCode = requestBody.unit_code;

  try {
    const updatePig = {
      pig_code: updatePigCode,
      rfid_code: updatePigRfid,
      unit_code: updateUnitCode,
      block_code: updateBlockCode,
    };
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    const updatePigSchema = Joi.object({
      pig_code: Joi.string().alphanum(),
      rfid_code: Joi.string().alphanum(),
      unit_code: Joi.string()
        .lowercase()
        .pattern(new RegExp(/^unit_+[0-9]+[0-9]+[0-9]+[0-9]$/))
        .min(9)
        .max(9),
      block_code: Joi.string()
        .lowercase()
        .pattern(new RegExp(/^block_+[0-9]+[0-9]+[0-9]+[0-9]$/))
        .min(10)
        .max(10),
    });

    const { error } = updatePigSchema.validate(updatePig);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial male pig mongoose object
    const MalePig = await malePig(selectedCompany);
    //initial female pig mongoose object
    const FemalePig = await femalePig(selectedCompany);

    //update pig
    const filter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    let foundPig;
    !foundPig ? (foundPig = await MalePig.findOne(filter)) : null;
    !foundPig ? (foundPig = await FemalePig.findOne(filter)) : null;

    if (!foundPig) {
      return sendResponse(res, false, "Pig is not found", "PigNotFound", null);
    }

    updatePigCode ? (foundPig.pig_code = updatePigCode) : null;
    updatePigRfid ? (foundPig.rfid_code = updatePigRfid) : null;
    updateBlockCode ? (foundPig.block_code = updateBlockCode) : null;
    updateUnitCode ? (foundPig.unit_code = updateUnitCode) : null;

    //save pig
    const savedPig = await foundPig.save();

    return sendResponse(res, true, "Pig was updated successful", null, savedPig);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

exports.deletePigWithRfidCode = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for use to delete pigs
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial male pig mongoose object
    const MalePig = await malePig(selectedCompany);
    //initial female pig mongoose object
    const FemalePig = await femalePig(selectedCompany);

    //delete pig
    const filter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    let deletedPig = null;
    !deletedPig ? (deletedPig = await MalePig.findOneAndDelete(filter)) : null;
    !deletedPig ? (deletedPig = await FemalePig.findOneAndDelete(filter)) : null;
    //check if pig was not found
    if (!deletedPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }
    return sendResponse(res, true, "Pig was deleted successful", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getPigVaccinations = async (req, res) => {
  const selectedCompanyName = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for use to delete pigs
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const MalePig = await malePig(selectedCompanyName);

    //find pig
    let foundPig = null;
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    !foundPig ? ((foundPig = await FemalePig.findOne(pigFilter)), { __v: 0 }) : null;
    !foundPig ? ((foundPig = await MalePig.findOne(pigFilter)), { __v: 0 }) : null;

    //check if pig were not found
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    } else {
      const pigVaccination = foundPig.vaccinations;
      //check if vaccinations were not found
      if (pigVaccination.length === 0) {
        return sendResponse(res, false, "Pig vaccinations were not found ", "PigVaccinationsNotFound", null);
      }
      return sendResponse(res, true, "Pig vaccinations were found", null, foundPig.vaccinations);
    }
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.newPigVaccination = async (req, res) => {
  const selectedCompanyName = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for find pig
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  const requestBody = req.body;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //validation
    const vaccinationSchema = Joi.object({
      vaccine_lot_code: Joi.string().alphanum().required(),
      vaccination_date: Joi.date().required(),
    });

    const { error } = vaccinationSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const MalePig = await malePig(selectedCompanyName);

    //find pig
    let foundPig = null;

    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    !foundPig ? (foundPig = await FemalePig.findOne(pigFilter)) : null;
    !foundPig ? (foundPig = await MalePig.findOne(pigFilter)) : null;
    if (!foundPig) {
      return sendResponse(res, false, "Pig is not found.", "PigNotFound", null);
    }

    //set vaccinations array to pig
    foundPig.vaccinations.push(requestBody);
    //save pig
    const savedPig = await foundPig.save();
    return sendResponse(res, true, "Vaccination was added to pig successful.", null, savedPig.vaccinations);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.deletePigVaccinations = async (req, res) => {
  const selectedCompanyName = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for find pig
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const MalePig = await malePig(selectedCompanyName);

    //find pig
    let foundPig = null;

    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    !foundPig ? (foundPig = await FemalePig.findOne(pigFilter)) : null;
    !foundPig ? (foundPig = await MalePig.findOne(pigFilter)) : null;
    if (!foundPig) {
      return sendResponse(res, false, "Pig is not found.", "PigNotFound", null);
    }

    //set vaccinations array to pig
    foundPig.vaccinations = null;
    //save pig
    const savedPig = await foundPig.save();
    return sendResponse(res, true, "Vaccinations was deleted to pig successful.", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getPigVaccination = async (req, res) => {
  const selectedCompanyName = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for find pig
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  const selectedVaccinationId = req.params.vaccination_id; //for get vaccination data
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const MalePig = await malePig(selectedCompanyName);

    //find pig
    let foundPig = null;

    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    !foundPig ? (foundPig = await FemalePig.findOne(pigFilter)) : null;
    !foundPig ? (foundPig = await MalePig.findOne(pigFilter)) : null;
    if (!foundPig) {
      return sendResponse(res, false, "Pig is not found.", "PigNotFound", null);
    }

    let foundVaccinaton;
    //find specify vaccination with vaccination id
    for (let i = 0; i < foundPig.vaccinations.length; i++) {
      if (foundPig.vaccinations[i].id === selectedVaccinationId) {
        foundVaccinaton = foundPig.vaccinations[i];
        break;
      }
    }

    if (!foundVaccinaton) {
      return sendResponse(res, false, "Vaccination was not found.", "VaccinationNotFound", null);
    }

    return sendResponse(res, true, "Vaccination was found.", null, foundVaccinaton);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.editPigVaccinations = async (req, res) => {
  const selectedCompanyName = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for find pig
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  const selectedVaccinationId = req.params.vaccination_id; //for edit vaccination data
  const requestBody = req.body;
  const updateVaccineLotCode = requestBody.vaccine_lot_code;
  const updateVaccinationDate = requestBody.vaccination_date;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied",null);
    }

    //validation
    const vaccinationSchema = Joi.object({
      vaccine_lot_code: Joi.string().alphanum(),
      vaccination_date: Joi.date(),
    });

    const { error } = vaccinationSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const MalePig = await malePig(selectedCompanyName);

    //find pig
    let foundPig = null;

    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    !foundPig ? (foundPig = await FemalePig.findOne(pigFilter)) : null;
    !foundPig ? (foundPig = await MalePig.findOne(pigFilter)) : null;
    if (!foundPig) {
      return sendResponse(res, false, "Pig is not found.", "PigNotFound", null);
    }

    let isVaccinationFound = false;
    //find specify vaccination with vaccination id
    for (let i = 0; i < foundPig.vaccinations.length; i++) {
      if (foundPig.vaccinations[i].id === selectedVaccinationId) {
        isVaccinationFound = true;
        updateVaccineLotCode ? (foundPig.vaccinations[i].vaccine_lot_code = updateVaccineLotCode) : null;
        updateVaccinationDate ? (foundPig.vaccinations[i].vaccination_date = updateVaccinationDate) : null;
        break;
      }
    }

    if (!isVaccinationFound) {
      return sendResponse(res, false, "Vaccination was not found.", "VaccinationNotFound", null);
    }

    //save updated foundPig
    const savedPig = await foundPig.save();
    return sendResponse(res, true, "Vaccination was edited successful.", null, savedPig);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.deletePigVaccination = async (req, res) => {
  const selectedCompanyName = req.params.company_name; //for use pig database
  const selectedFarmId = req.params.farm_id; //for find pig
  const selectedPigRfidCode = req.params.rfid_code; //for find pig
  const selectedVaccinationId = req.params.vaccination_id; //for find and delete specify vaccination data
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const MalePig = await malePig(selectedCompanyName);

    //find pig
    let foundPig = null;

    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    !foundPig ? (foundPig = await FemalePig.findOne(pigFilter)) : null;
    !foundPig ? (foundPig = await MalePig.findOne(pigFilter)) : null;
    if (!foundPig) {
      return sendResponse(res, false, "Pig is not found.", "PigNotFound", null);
    }

    let isVaccinationFound = false;
    //find specify vaccination with vaccination id and delete
    const vaccinationsLength = foundPig.vaccinations.length;
    for (let i = 0; i < foundPig.vaccinations.length; i++) {
      if (foundPig.vaccinations[i].id === selectedVaccinationId) {
        isVaccinationFound = true;
        foundPig.vaccinations.splice(i, 1);
        break;
      }
    }

    if (!isVaccinationFound) {
      return sendResponse(res, false, "Vaccination was not found.", "VaccinationNotFound", null);
    }

    const deletedFoundPigVaccinaiton = foundPig.save();
    return sendResponse(res, true, "Vaccination was deleted successful.", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.newPigsVaccinationUnit = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedUnitCode = req.params.unit_code;
  const selectedFarmId = req.params.farm_id;
  const requestBody = req.body;

  try {
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    ///validation
    const VaccinationSchema = Joi.object({
      vaccine_lot_code: Joi.string().alphanum().required(),
      vaccination_date: Joi.date().required(),
    });

    const { error } = VaccinationSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const MalePig = await malePig(selectedCompanyName);

    const pigFilter = { farm_id: selectedFarmId, unit_code: selectedUnitCode };
    const vaccinationUpdate = { $push: { vaccinations: requestBody } };
    const foundFemalePigs = await FemalePig.updateMany(pigFilter, vaccinationUpdate);
    const foundMalePigs = await MalePig.updateMany(pigFilter, vaccinationUpdate);
    const countUpdated = foundFemalePigs.modifiedCount + foundMalePigs.modifiedCount;
    if (countUpdated == 0) {
      return sendResponse(res, false, "Pigs were not found", "PigsNotFound", null);
    }
    return sendResponse(res, true, countUpdated + " Vaccination pig by unit was updated successful", null, requestBody);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getBreeds = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    //check if pig was not found
    if (!foundPig) {
      return sendResponse(res, false, "Pig is not found", "PigNotFound", null);
    }
    //check if pig breeds not found
    if (foundPig.breeds.length === 0) {
      return sendResponse(res, false, "Pig breeds is not found", "PigBreedsNotFound",null);
    }
    return sendResponse(res, true, "Pig breeds is found", null, foundPig.breeds);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.newBreed = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const requestBody = req.body;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }
    //breed validation
    const breedSchema = Joi.object({
      breed_date: Joi.date().required(),
      sperm_code: Joi.string().required(),
      companyUser_breeder_id: Joi.objectId().required(),
    });

    const { error } = breedSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial company user mongoose object
    const CompanyUser = await companyUser(selectedCompanyName);
    const foundCompanyUsers = await CompanyUser.find();
    let isCompanyUserExisted = false;
    for (let j = 0; j < foundCompanyUsers.length; j++) {
      if (requestBody.companyUser_breeder_id === foundCompanyUsers[j].id) {
        isCompanyUserExisted = true;
        break;
      }
    }

    if (!isCompanyUserExisted) {
      return sendResponse(res, false, "Company user breeder not found", "CompanyUserNotFound", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }

    requestBody.new_born = null;
    foundPig.breeds.push(requestBody);
    const savedPig = await foundPig.save();
    return sendResponse(res, true, "Breed added successful", null, savedPig.breeds);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.deleteBreeds = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }

    //delete breeds
    foundPig.breeds = null;
    //save pig deleted breeds
    const deletedBreedPig = foundPig.save();
    return sendResponse(res, true, "Pig breed was deleted successful", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getBreed = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedBreedId = req.params.breed_id;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }

    let foundBreed;
    for (let i = 0; i < foundPig.breeds.length; i++) {
      if (foundPig.breeds[i].id === selectedBreedId) {
        foundBreed = foundPig.breeds[i];
        break;
      }
    }

    if (!foundBreed) {
      return sendResponse(res, false, "Pig breed was not found", "PigBreedNotFound", null);
    }
    return sendResponse(res, true, "Pig breed was found", null, foundBreed);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.editBreed = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedBreedId = req.params.breed_id;
  const requestBody = req.body;
  const editBreedDate = requestBody.breed_date;
  const editSpermCode = requestBody.sperm_code;
  const editCompanyUserBreederId = requestBody.companyUser_breeder_id;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //breed validation
    const breedSchema = Joi.object({
      breed_date: Joi.date(),
      sperm_code: Joi.string(),
      companyUser_breeder_id: Joi.objectId(),
    });

    const { error } = breedSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }

    let isBreedFound = false;
    for (let i = 0; i < foundPig.breeds.length; i++) {
      if (foundPig.breeds[i].id === selectedBreedId) {
        isBreedFound = true;
        editBreedDate ? (foundPig.breeds[i].breed_date = editBreedDate) : null;
        editSpermCode ? (foundPig.breeds[i].sperm_code = editSpermCode) : null;
        editCompanyUserBreederId ? (foundPig.breeds[i].companyUser_breeder_id = editCompanyUserBreederId) : null;
        break;
      }
    }

    if (!isBreedFound) {
      return sendResponse(res, false, "Pig Breed not found", "PigBreedNotFound", null);
    }

    //save edited breed
    const savedEditedBreedPig = await foundPig.save();
    return sendResponse(res, true, "Pig breed was edited successful ", null, savedEditedBreedPig.breeds);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.deleteBreed = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedBreedId = req.params.breed_id;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }

    let isBreedFound = false;
    for (let i = 0; i < foundPig.breeds.length; i++) {
      if (foundPig.breeds[i].id === selectedBreedId) {
        isBreedFound = true;
        foundPig.breeds.splice(i, 1);
        break;
      }
    }

    if (!isBreedFound) {
      return sendResponse(res, false, "Pig Breed not found", "PigBreedNotFound", null);
    }

    //save edited breed
    const savedDeletedBreedPig = await foundPig.save();
    return sendResponse(res, true, "Pig breed was deleted successful ", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getNewBorn = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedBreedId = req.params.breed_id;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }

    let foundBreed;
    for (let i = 0; i < foundPig.breeds.length; i++) {
      if (foundPig.breeds[i].id === selectedBreedId) {
        foundBreed = foundPig.breeds[i];
        break;
      }
    }

    if (!foundBreed) {
      return sendResponse(res, false, "Pig breed was not found", "PigBreedNotFound", null);
    }

    if (!foundBreed.new_born) {
      return sendResponse(res, false, "Pig breed new born was not found", "PigBreedNewBornNotFound", null);
    }
    return sendResponse(res, true, "Pig breed was found", null, foundBreed.new_born);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.editNewBorn = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedBreedId = req.params.breed_id;
  const requestBody = req.body;
  const editPigAlive = requestBody.pig_alive;
  const editPigDeath = requestBody.pig_death;
  const editBornDate = requestBody.born_date;
  const editSumWeightKg = requestBody.sum_weight_kg;
  const editWeanDate = requestBody.wean_date;
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //newborn validation
    const editBornSchema = Joi.object({
      pig_alive: Joi.number(),
      pig_death: Joi.number(),
      born_date: Joi.date(),
      sum_weight_kg: Joi.number(),
      wean_date: Joi.date(),
    });

    const { error } = editBornSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial female pig and pig mongoose object
    const FemalePig = await femalePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await FemalePig.findOne(pigFilter, { __v: 0 });
    if (!foundPig) {
      return sendResponse(res, false, "Pig was not found", "PigNotFound", null);
    }

    let isEditBreedNewBorn = false;
    let editNewBorn = null;
    for (let i = 0; i < foundPig.breeds.length; i++) {
      if (foundPig.breeds[i].id === selectedBreedId) {
        if (foundPig.breeds[i].new_born) {
          editNewBorn = foundPig.breeds[i].new_born;
        }
        editPigAlive ? (editNewBorn.pig_alive = editPigAlive) : null;
        editPigDeath ? (editNewBorn.pig_death = editPigDeath) : null;
        editBornDate ? (editNewBorn.born_date = editBornDate) : null;
        editSumWeightKg ? (editNewBorn.sum_weight_kg = editSumWeightKg) : null;
        editWeanDate ? (editNewBorn.wean_date = editWeanDate) : null;
        foundPig.breeds[i].new_born = editNewBorn;
        isEditBreedNewBorn = true;
        break;
      }
    }

    if (!isEditBreedNewBorn) {
      return sendResponse(res, false, "Pig breed was not found", "PigBreedNotFound", null);
    }

    //save pig
    const savedEditedNewBornPig = await foundPig.save();
    return sendResponse(res, true, "Pig breed was edited successful", null, savedEditedNewBornPig.breeds);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.newSperm = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const requestBody = req.body;
  // const newDateCollectSperm = requestBody.date_collect_sperm;
  // const newcompanyUserCollectSperm = requestBody.companyUser_collect_sperm;
  try {
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //sperm validation
    const newSpermSchema = Joi.object({
      date_collect_sperm: Joi.date().required(),
      companyUser_collect_sperm: Joi.objectId().required(),
    });

    const { error } = newSpermSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial company user mongoose object
    const CompanyUser = await companyUser(selectedCompanyName);
    const foundCompanyUsers = await CompanyUser.find();
    let isCompanyUserExisted = false;
    for (let j = 0; j < foundCompanyUsers.length; j++) {
      if (requestBody.companyUser_collect_sperm === foundCompanyUsers[j].id) {
        isCompanyUserExisted = true;
        break;
      }
    }

    if (!isCompanyUserExisted) {
      return sendResponse(res, false, "Company user collect sperm not found", "CompanyUserNotFound", null);
    }

    //get sperms from male pig
    //initial male pig
    const MalePig = await malePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await MalePig.findOne(pigFilter, { __v: 0 });

    if (!foundPig) {
      return sendResponse(res, false, "Pig not found", "PigNotFound", null);
    }

    //add new sperm to foundPig
    foundPig.sperms.push(requestBody);
    //save foundPig
    const savedNewSpermPig = await foundPig.save();

    return sendResponse(res, true, "New sperm added to pig", null, savedNewSpermPig.sperms);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
exports.getSperms = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  try {
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }
    //get sperms from male pig
    //initial male pig
    const MalePig = await malePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await MalePig.findOne(pigFilter, { __v: 0 });

    if (!foundPig) {
      return sendResponse(res, false, "Pig not found", "PigNotFound", null);
    }
    if (foundPig.sperms.length === 0) {
      return sendResponse(res, false, "Pig sperms not found", "PigSpermsNotFound", null);
    }
    return sendResponse(res, true, "Pig sperms found", null, foundPig.sperms);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.deleteSperms = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  try {
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }
    //get sperms from male pig
    //initial male pig
    const MalePig = await malePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await MalePig.findOne(pigFilter, { __v: 0 });

    if (!foundPig) {
      return sendResponse(res, false, "Pig not found", "PigNotFound", null);
    }
    //delete sperms pig
    foundPig.sperms = null;

    return sendResponse(res, true, "Pig sperms deleted successful", null, foundPig.sperms);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getSperm = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedSpermId = req.params.sperm_id;
  try {
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }
    //get sperm from male pig
    //initial male pig
    const MalePig = await malePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await MalePig.findOne(pigFilter, { __v: 0 });

    // console.log(foundPig);

    if (!foundPig) {
      return sendResponse(res, false, "Pig not found", "PigNotFound", null);
    }

    let foundSperm;
    for (let i = 0; i < foundPig.sperms.length; i++) {
      if (foundPig.sperms[i].id === selectedSpermId) {
        foundSperm = foundPig.sperms[i];
        break;
      }
    }

    if (!foundSperm) {
      return sendResponse(res, false, "Pig sperm not found", "PigSpermNotFound", null);
    }

    return sendResponse(res, true, "Pig sperms found", null, foundSperm);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.editSperm = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedSpermId = req.params.sperm_id;
  const requestBody = req.body;
  const selectedDateCollectSperm = requestBody.date_collect_sperm;
  const selectedCompanyUserCollectSperm = requestBody.companyUser_collect_sperm;
  try {
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //sperm validation
    const editSpermSchema = Joi.object({
      date_collect_sperm: Joi.date(),
      companyUser_collect_sperm: Joi.objectId(),
    });

    const { error } = editSpermSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial company user mongoose object
    const CompanyUser = await companyUser(selectedCompanyName);
    const foundCompanyUsers = await CompanyUser.find();
    let isCompanyUserExisted = false;
    for (let j = 0; j < foundCompanyUsers.length; j++) {
      if (requestBody.companyUser_collect_sperm === foundCompanyUsers[j].id) {
        isCompanyUserExisted = true;
        break;
      }
    }

    if (!isCompanyUserExisted) {
      return sendResponse(res, false, "Company user collect sperm not found", "CompanyUserNotFound", null);
    }

    //get sperm from male pig
    //initial male pig
    const MalePig = await malePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await MalePig.findOne(pigFilter, { __v: 0 });

    if (!foundPig) {
      return sendResponse(res, false, "Pig not found", "PigNotFound", null);
    }
    if (foundPig.sperms.length === 0) {
      return sendResponse(res, false, "Pig sperm not found", "PigSpermNotFound", null);
    }

    let isEditSperm = false;
    for (let i = 0; i < foundPig.sperms.length; i++) {
      if (foundPig.sperms[i].id === selectedSpermId) {
        foundPig.sperms[i].date_collect_sperm = selectedDateCollectSperm;
        foundPig.sperms[i].companyUser_collect_sperm = selectedCompanyUserCollectSperm;
        isEditSperm = true;
        break;
      }
    }

    if (!isEditSperm) {
      return sendResponse(res, false, "Pig sperm not found", "PigSpermNotFound", null);
    }

    //saved foundPig
    const savedEditedSperm = await foundPig.save();

    return sendResponse(res, true, "Pig sperm was edited successful", null, savedEditedSperm.sperms);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.deleteSperm = async (req, res) => {
  const selectedCompanyName = req.params.company_name;
  const selectedFarmId = req.params.farm_id;
  const selectedPigRfidCode = req.params.rfid_code;
  const selectedSpermId = req.params.sperm_id;
  try {
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //get sperm from male pig
    //initial male pig
    const MalePig = await malePig(selectedCompanyName);
    const pigFilter = { rfid_code: selectedPigRfidCode, farm_id: selectedFarmId };
    const foundPig = await MalePig.findOne(pigFilter, { __v: 0 });

    if (!foundPig) {
      return sendResponse(res, false, "Pig not found", "PigNotFound", null);
    }
    if (foundPig.sperms.length === 0) {
      return sendResponse(res, false, "Pig sperm not found", "PigSpermNotFound", null);
    }

    let isDeleteSperm = false;
    for (let i = 0; i < foundPig.sperms.length; i++) {
      if (foundPig.sperms[i].id === selectedSpermId) {
        foundPig.sperms.splice(i, 1);
        isDeleteSperm = true;
        break;
      }
    }

    if (!isDeleteSperm) {
      return sendResponse(res, false, "Pig sperm not found", "PigSpermNotFound", null);
    }

    //saved foundPig
    const savedDeletedSperm = await foundPig.save();

    return sendResponse(res, true, "Pig sperm was deleted successful", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

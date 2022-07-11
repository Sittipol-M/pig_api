//////////import send response//////////
const { sendResponse, sendErrorResponse, sendValidationErrorResponse } = require("../../sendResponse/sendResponse");

//////////farm section//////////
//-> farm mongoose model
const { farm } = require("../../dbs/companyDb/farmsCollection");

//////////company user section//////////
//-> company user mongoose model
const { companyUser } = require("../../dbs/companyDb/companyUsersCollection");

//-> validation
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.getFarms = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company db
  try {
    // check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial farm mongoose object
    const Farm = farm(selectedCompany);

    //find farms
    const foundFarms = await Farm.find({}, { __v: 0 });
    //ckeck if farms are not existed
    if (foundFarms.length === 0) {
      return sendResponse(res, false, "Farms was not found", "FarmsNotFound", null);
    }
    return sendResponse(res, true, "Farms was found", null, foundFarms);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

exports.newFarm = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company db
  const requestBody = req.body;
  const newfarmName = requestBody.farm_name; //for create new farm
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //check validation
    const farmSchema = Joi.object({
      farm_name: Joi.string().required(),
    });
    const { error } = farmSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    // initial farm mongoose object
    const Farm = await farm(selectedCompany);
    //check if farm existed
    const farmFilter = { farm_name: newfarmName };
    const foundFarm = await Farm.findOne(farmFilter, { __v: 0 });
    if (foundFarm) {
      return sendResponse(res, false, "Farm is existed", "FarmExisted", null);
    }

    //create new farm for user
    const newFarm = new Farm({ farm_name: newfarmName });
    const savedFarm = await newFarm.save();

    //add farm permission to owner
    //initial company user mongoose object
    const CompanyUser = await companyUser(selectedCompany);
    const foundCompanyUsers = await CompanyUser.find(null);
    //add to every owner of this company
    if (foundCompanyUsers) {
      for (let i = 0; i < foundCompanyUsers.length; i++) {
        if (foundCompanyUsers[i].position === "Owner") {
          foundCompanyUsers[i].farm_permissions.push({
            farm_id: savedFarm.id,
            farm_name: savedFarm.farm_name,
            permission: true,
          });
          foundCompanyUsers[i].save();
        } else {
          foundCompanyUsers[i].farm_permissions.push({
            farm_id: savedFarm.id,
            farm_name: savedFarm.farm_name,
            permission: false,
          });
          foundCompanyUsers[i].save();
        }
      }
    }
    return sendResponse(res, true, "Farm was created", null, savedFarm);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.deleteFarms = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company user db
  try {
    //check permission
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial User mongoose object
    const Farm = farm(selectedCompany);

    //find and delete farms if it existed
    const { deletedCount } = await Farm.deleteMany(null);
    //if farms is not existed
    if (deletedCount == 0) {
      return sendResponse(res, false, "farms was not found", "FarmsNotFound", null);
    }

    // initial company user
    const CompanyUser = await companyUser(selectedCompany);
    const foundCompanyUsers = await CompanyUser.find({});
    for (let i = 0; i < foundCompanyUsers.length; i++) {
      foundCompanyUsers[i].farm_permissions = [];
      await foundCompanyUsers[i].save();
    }
    return sendResponse(res, true, deletedCount + " farms was deleted successful", null, null);
  } catch (err) {
    return sendErrorResponse(res, err);
  }
};

exports.editFarm = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company user db
  const selectedFarmId = req.params.farm_id; //for find farm
  const requestBody = req.body;
  const editFarmName = requestBody.farm_name; //for update farm's farm_name

  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //check validation
    const farmSchema = Joi.object({
      farm_name: Joi.string().required(),
    });
    const { error } = farmSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    // initial User mongoose object
    const Farm = farm(selectedCompany);
    //find and update if it is existed
    const foundFarm = await Farm.findById(selectedFarmId);
    if (!foundFarm) {
      return sendResponse(res, false, "Farm was not found", "FarmNotFound", null);
    }

    //update farm's farm_name
    editFarmName ? (foundFarm.farm_name = editFarmName) : null;
    //save updated farm
    const savedFarm = await foundFarm.save();
    return sendResponse(res, true, "Farm was updated successful", null, savedFarm);
  } catch (err) {
    return sendErrorResponse(res, err);
  }
};

exports.getFarm = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company user db
  const selectedFarmId = req.params.farm_id; //for find farm
  try {
    //check permission
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial User mongoose object
    const Farm = farm(selectedCompany);

    //find farm if it is not existed
    const foundFarm = await Farm.findById(selectedFarmId, { __v: 0 });
    if (!foundFarm) {
      return sendResponse(res, false, "Farm is not existed", "FarmNotFound", null);
    }
    return sendResponse(res, true, "Farm was found", null, foundFarm);
  } catch (err) {
    return sendErrorResponse(res, err);
  }
};

exports.deleteFarm = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company user db
  const selectedFarmId = req.params.farm_id; //for find farm
  try {
    // check permission
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial User mongoose object
    const Farm = farm(selectedCompany);
    const deletedFarm = await Farm.findByIdAndDelete(selectedFarmId);
    if (!deletedFarm) {
      return sendResponse(res, false, "Farm was not found", "FarmNotFound", null);
    }

    // initial company user
    const CompanyUser = await companyUser(selectedCompany);
    const foundCompanyUsers = await CompanyUser.find({});
    for (let i = 0; i < foundCompanyUsers.length; i++) {
      for (let j = 0; j < foundCompanyUsers[i].farm_permissions.length; j++) {
        // console.log(foundCompanyUsers[i].farm_permissions[j].farm_id.toString() + selectedFarmId.toString());
        if (foundCompanyUsers[i].farm_permissions[j].farm_id.toString() === selectedFarmId.toString()) {
          foundCompanyUsers[i].farm_permissions.splice(j, 1);
        }
      }
      await foundCompanyUsers[i].save();
    }

    return sendResponse(res, true, "Farm was deleted successful", null, null);
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res, error);
  }
};

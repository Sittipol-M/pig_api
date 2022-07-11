//////////import send response//////////
const { sendResponse, sendErrorResponse, sendValidationErrorResponse } = require("../../sendResponse/sendResponse");

//////////company user and user section//////////
//-> User mongoose model
const { user } = require("../../dbs/mainPigDb/usersCollection");
//-> company user mongoose model
const { companyUser } = require("../../dbs/companyDb/companyUsersCollection");

//////////farm section//////////
//-> farm mongoose model
const { farm } = require("../../dbs/companyDb/farmsCollection");

//-> validation
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.getCompanyUsers = async (req, res) => {
  const selectedCompany = req.params.company_name; //
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial company user mongoose object
    const CompanyUser = companyUser(selectedCompany);

    //check if companyUsers is existed
    const foundCompanyUsers = await CompanyUser.find({}, { __v: 0 });
    if (foundCompanyUsers.length === 0) {
      return sendResponse(res, false, "Company Users was not found", "CompanyUsersNotFound", null);
    }
    return sendResponse(res, true, "Company Users was found", null, foundCompanyUsers);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

exports.getCompanyUser = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company user db
  const selectedCompanyUserId = req.params.companyUser_id; //for find specify company user
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial company user mongoose object
    const CompanyUser = companyUser(selectedCompany);

    //check if companyUser is not existed
    const foundCompanyUser = await CompanyUser.findById(selectedCompanyUserId, { __v: 0 });
    if (!foundCompanyUser) {
      return sendResponse(res, false, "Company User was not found", "CompanyUserNotFound", null);
    }
    return sendResponse(res, true, "Company user was found", null, foundCompanyUser);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

exports.editCompanyUser = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company user db
  const selectedCompanyUserId = req.params.companyUser_id; //for find company user
  const requestBody = req.body;
  const editName = requestBody.name; //for edit company user's name
  const editSurname = requestBody.surname; //for edit company user's surname
  const editPosition = requestBody.position; //for edit company user's position
  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // validate
    const updateCompanyUserSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      surname: Joi.string().min(3).max(30).required(),
      position: Joi.string().valid("Husbandman", "Veterinarian", "Owner").required(),
    });
    const { error } = updateCompanyUserSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    // initial company user mongoose object
    const CompanyUser = await companyUser(selectedCompany);

    const foundCompanyUser = await CompanyUser.findById(selectedCompanyUserId, { __v: 0 });
    if (!foundCompanyUser) {
      return sendResponse(res, false, "Company User is not found", "CompanyUserNotFound", null);
    }

    //edit company user's name
    foundCompanyUser.name = editName;
    //edit company user's surname
    foundCompanyUser.surname = editSurname;
    //edit company user 's position
    foundCompanyUser.position = editPosition;
    if (editPosition === "Admin") {
      //add own farm permission to company user
      //initial farm mongoose object
      const Farm = await farm(selectedCompany);
      const foundFarms = await Farm.find({}, { __v: 0 });
      //edit company user 's to owner farm permission
      foundCompanyUser.farm_permissions = foundFarms;
    }
    //save edit company user
    const savedCompanyUser = await foundCompanyUser.save();
    return sendResponse(res, false, "Company User was edited", "CompanyUserEdited", savedCompanyUser);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

exports.deleteCompanyUser = async (req, res) => {
  const userAuthData = req.userAuthData;
  const selectedCompany = req.params.company_name;
  const companyUserId = req.params.companyUser_id;
  try {
    //check permission
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial company user mongoose object
    const CompanyUser = companyUser(selectedCompany);
    //find for position permission
    const foundCompanyUser = await CompanyUser.findById(companyUserId);

    //cannot delete owner if position is not "Admin"
    if (foundCompanyUser.position === "Owner" && !userAuthData.position === "Admin") {
      return sendResponse(res, false, "User does not have permission to delete owner", "AccessDenied", null);
    }

    //initial User mongoose object
    const User = user();
    //delete if User is existed from usersDb in users collection
    const deletedUser = await User.findByIdAndDelete(companyUserId);

    //delete if companyUser is existed from companyDb in companyusers collection
    const deletedCompanyUser = await CompanyUser.findByIdAndDelete(companyUserId);

    if (!deletedCompanyUser && !deletedUser) {
      return sendResponse(res, false, "Company User is not found", "ComputerUserNotFound", null);
    }
    return sendResponse(res, true, "Computer User was deleted succeccful", null, null);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

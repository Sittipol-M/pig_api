//////////import send response//////////
const { sendResponse, sendErrorResponse } = require("../../sendResponse/sendResponse");

//////////company user and user section//////////
//-> company user mongoose model
const { companyUser } = require("../../dbs/companyDb/companyUsersCollection");

/////////mongoose//////////
var ObjectId = require("mongodb").ObjectId;

exports.getCompanyUserFarmPermissions = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company db
  const selectedCompanyUserId = req.params.companyUser_id; //for find company user
  try {
    // check permission
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    // initial company user mongoose object
    const CompanyUser = await companyUser(selectedCompany, { __v: 0 });

    //find companyUser farm permissions
    const foundCompanyUser = await CompanyUser.findById(selectedCompanyUserId);
    //check if companyUser is not existed
    if (!foundCompanyUser) {
      return sendResponse(res, false, "Company User is not found", "CompanyUserNotFound", null);
    }
    //check if company user does not have permisssions
    if (foundCompanyUser.farm_permissions.length === 0) {
      return sendResponse(res, true, "Company user farm permissions was not found", "FarmPermissionsNotFound", null);
    }
    return sendResponse(res, true, "Company user farm permissions was found", null, foundCompanyUser.farm_permissions);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.editCompanyUserFarmPermission = async (req, res) => {
  const selectedCompany = req.params.company_name; //for use company db
  const selectedCompanyUserId = req.params.companyUser_id; //for find company user
  const selectedFarmId = req.params.farm_id; //for delete to edit farm permission
  const editFarmPermission = req.body.permission;
  try {
    // check permission
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission in this company", "AccessDenied", null);
    }

    //initial company user mongoose object
    const CompanyUser = await companyUser(selectedCompany);
    //find user
    const foundCompanyUser = await CompanyUser.findById(selectedCompanyUserId);
    //check if company user is not existed
    if (!foundCompanyUser) {
      return sendResponse(res, false, "Company user was not found", "CompanyUserNotFound", null);
    }

    //check if company user does not have permisssions
    if (foundCompanyUser.farm_permissions.length === 0) {
      return sendResponse(res, true, "Company user farm permissions was not found", "FarmPermissionsNotFound", null);
    }

    // edit farm permission
    for (let i = 0; i < foundCompanyUser.farm_permissions.length; i++) {
      if (foundCompanyUser.farm_permissions[i].farm_id.toString() === selectedFarmId.toString()) {
        foundCompanyUser.farm_permissions[i].permission = editFarmPermission;
        break;
      }
    }

    foundCompanyUser.save();
    return sendResponse(res, true, "Company user farm permission was edited successful", null, null);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

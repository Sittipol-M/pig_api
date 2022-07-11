/////////mongoose//////////
var ObjectId = require("mongodb").ObjectId;

/////////companies section//////////
//-> company mongoose model
const { company } = require("../dbs/mainPigDb/companiesCollection");

//////////company user and user section//////////
//-> company user mongoose model
const { companyUser } = require("../dbs/companyDb/companyUsersCollection");
const { sendErrorResponse } = require("../sendResponse/sendResponse");

module.exports.adminPermission = adminPermission = async (req, res, next) => {
  try {
    const selectedCompanyName = req.params.company_name;
    //initial company for if database not existed
    const Company = new company();
    const foundCompany = await Company.findOne({ company_name: selectedCompanyName });
    if (!foundCompany) {
      return sendResponse(res, false, "Company is not found", "CompanyNotFound", null);
    }
    const userAuthData = req.userAuthData;
    if (userAuthData.position === "Admin") {
      req.access = true;
    } else {
      req.access = false;
    }
    return next();
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

module.exports.companyOwnerPermission = companyOwnerPermission = async (req, res, next) => {
  try {
    const selectedCompanyName = req.params.company_name;
    const userAuthData = req.userAuthData;
    if (req.access) {
      return next();
    } else {
      if (userAuthData.position === "Owner" && userAuthData.company === selectedCompanyName) {
        req.access = true;
      }
      return next();
    }
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

module.exports.employeePermission = employeePermission = async (req, res, next) => {
  try {
    const employeePositions = ["HusbandMan", "Veternarian"];
    const selectedCompanyName = req.params.company_name;
    const selectedFarmId = req.params.farm_id;
    const selectedCompanyUserId = req.params.companyUser_id;
    const userAuthData = req.userAuthData;
    if (req.access) {
      return next();
    } else {
      if (selectedFarmId) {
        //check if farm permission is allow
        for (let i = 0; i < employeePositions.length; i++) {
          //check position
          if (employeePositions[i] === userAuthData.position) {
            const CompanyUser = companyUser(selectedCompanyName);
            const foundCompanyUser = await CompanyUser.findById(userAuthData.id);
            const employeeFarmPermissions = foundCompanyUser.farm_permissions;
            //check farm permissions
            if (employeeFarmPermissions.length === 0) {
              break;
            }
            if (employeeFarmPermissions.length > 0) {
              for (let i = 0; i < employeeFarmPermissions.length; i++) {
                if (employeeFarmPermissions[i].id === selectedFarmId) {
                  req.access = true;
                  break;
                }
              }
            }
          }
        }
      }
      //check if to get own company user data
      if (selectedCompanyUserId === userAuthData.id) {
        req.access = true;
      }
      return next();
    }
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//////////import send response//////////
const { sendResponse, sendErrorResponse, sendValidationErrorResponse } = require("../sendResponse/sendResponse");

//-> validation
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

//-> User mongoose model
const { user } = require("../dbs/mainPigDb/usersCollection");
//-> company user mongoose model
const { companyUser } = require("../dbs/companyDb/companyUsersCollection");

//////////admin imports section//////////
//-> Admin mongoose model
const { admin } = require("../dbs/mainPigDb/adminsCollection");

/////////company imports section/////////
//-> company mongoose model
const { company } = require("../dbs/mainPigDb/companiesCollection");

/////////farms section//////////
//-> farm mongoose model
const { farm } = require("../dbs/companyDb/farmsCollection");

const tokenExpire = "7d";

exports.adminRegister = async (req, res) => {
  const requestBody = req.body;
  const registerUsername = requestBody.username; //for create new admin username
  const registerPassword = requestBody.password; //for create new admin hashedPassword
  const registerName = requestBody.name; //for create new admin name
  const registerSurname = requestBody.surname; //for create new admin surname
  const registerSex = requestBody.sex; //for create new admin sex
  try {
    //create register admin object
    const registerAdmin = {
      username: registerUsername,
      password: registerPassword,
      name: registerName,
      surname: registerSurname,
      sex: registerSex,
    };
    //validation data with abmin object
    const adminRegisterSchema = Joi.object({
      username: Joi.string().alphanum().min(6).required(), //username is string, minimum = 6 letters,only alphabets and numbers
      password: Joi.string().min(6).required(),
      name: Joi.string().min(3).max(30).required(),
      surname: Joi.string().min(3).max(30).required(),
      sex: Joi.string().valid("male", "female").required(),
    });
    const { error } = adminRegisterSchema.validate(registerAdmin);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial Admin user mongoose object
    const Admin = admin();
    //check if admin is existed
    const filter = { username: registerUsername };
    const foundAdmin = await Admin.findOne(filter);
    if (foundAdmin) {
      return sendResponse(res, false, "Admin is existed", "AdminExisted", null);
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerPassword, salt);

    //chang password to hashedPassword
    registerAdmin.password = hashedPassword;

    //create new Admin mongoose object
    const newAdmin = new Admin(registerAdmin);

    const savedAdmin = await newAdmin.save();
    return sendResponse(res, true, "Admin was registered", null, {
      username: savedAdmin.username,
      company: savedAdmin.company,
      _id: savedAdmin.id,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.adminLogin = async (req, res) => {
  const requestBody = req.body;
  const loginUsername = requestBody.username; // username for check login
  const loginPassword = requestBody.password; // password for check login
  try {
    //initial Admin mongoose object
    const Admin = admin();
    //check if admin user is not existed
    const filter = { username: loginUsername };
    const foundAdmin = await Admin.findOne(filter);
    if (!foundAdmin) {
      return sendResponse(res, false, "Admin User is not existed", "InvalidUsername", null);
    }

    // check if password is not correct
    const validPassword = await bcrypt.compare(loginPassword, foundAdmin.password);
    if (!validPassword) {
      return sendResponse(res, false, "Password is not correct", "InvalidPassword", null);
    }
    //set jsonwebtoken for authentication and authorization
    const authToken = jwt.sign(
      {
        id: foundAdmin.id,
        position: "Admin",
      },
      process.env.SECRET_KEY,
      { expiresIn: tokenExpire }
    );

    //set token to header
    res.header("authorization", authToken);
    return sendResponse(res, true, "login successful", null, {});
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.OwnerRegister = async (req, res) => {
  const requestBody = req.body;
  const registerUsername = requestBody.username; //for create new owner username
  const registerPassword = requestBody.password; //for create new owner password
  const registerName = requestBody.name; //for create new owner name
  const registerSurname = requestBody.surname; //for create owner surname
  const registerPosition = "Owner"; //for create new position for new user owner
  const registerCompany = requestBody.company; //for create new owner company

  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //validation data
    const ownerRegisterSchema = Joi.object({
      username: Joi.string().alphanum().min(6).required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().min(3).max(30).required(),
      surname: Joi.string().min(3).max(30).required(),
      company: Joi.string().alphanum().required(),
    });
    const { error } = ownerRegisterSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial User mongoose object
    const User = user();
    //find if user is existed
    const filter = { username: registerUsername, company: registerCompany };
    const foundUser = await User.findOne(filter);
    if (foundUser) {
      return sendResponse(res, false, "User is existed", "UserExisted", null);
    }

    //initial CompanyUser mongoose object
    const CompanyUser = await companyUser(registerCompany);
    const foundCompanyOwner = await CompanyUser.findOne({ position: "Owner" });
    if (foundCompanyOwner) {
      return sendResponse(res, false, "Can not create owner", "OwnerExisted", null);
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(registerPassword, salt);

    //save user owner
    const newUser = new User({
      username: registerUsername,
      password: hashPassword,
      company: registerCompany,
    });
    const savedUser = await newUser.save();

    //save for company users collection
    const newCompanyUser = new CompanyUser({
      _id: savedUser.id,
      username: registerUsername,
      name: registerName,
      surname: registerSurname,
      position: registerPosition,
    });
    const savedCompanyUser = await newCompanyUser.save();

    //save company name in companies
    //initial Company mongoose object
    const Company = company();

    //if company is not existed create new company
    if (!(await Company.findOne({ company_name: registerName }))) {
      const newCompany = new Company({
        company_name: registerCompany,
      });
      await newCompany.save();
    }

    savedUser.password = null;
    return sendResponse(res, true, "User Owner was registered", null, {
      _id: savedUser.id,
      username: savedCompanyUser.username,
      name: savedCompanyUser.name,
      surname: savedCompanyUser.surname,
      position: savedCompanyUser.position,
      farm_permissions: savedCompanyUser.farm_permissions,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.EmployeesRegister = async (req, res) => {
  const requestBody = req.body;
  const selectedCompany = req.params.company_name; //for create new employee and connect company db
  const registerUsername = requestBody.username; //for create new employee username
  const registerPassword = requestBody.password; //for create new employee password
  const registerName = requestBody.name; //for create new employee name
  const registerSurname = requestBody.surname; //for create new employee surname
  const registerPosition = requestBody.position; //for create new employee position

  try {
    //check access
    if (!req.access) {
      return sendResponse(res, false, "User does not have permission", "AccessDenied", null);
    }

    //validation
    const userRegisterSchema = Joi.object({
      username: Joi.string().alphanum().min(6).required(),
      password: Joi.string().alphanum().min(6).required(),
      name: Joi.string().min(3).max(30).required(),
      surname: Joi.string().min(3).max(30).required(),
      position: Joi.string().valid("Husbandman", "Veterinarian").required(),
    });
    const { error } = userRegisterSchema.validate(requestBody);
    if (error) {
      return sendValidationErrorResponse(res, error);
    }

    //initial User mongoose object
    const User = user();
    //find if user is existed
    const userFilter = { username: registerUsername };
    const foundUser = await User.findOne(userFilter);
    if (foundUser) {
      return sendResponse(res, false, "User is existed", "UserExisted", null);
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(registerPassword, salt);

    //save user employee
    const newUser = new User({
      username: registerUsername,
      password: hashPassword,
      company: selectedCompany,
    });

    //save username and password to main database
    const savedUser = await newUser.save();

    //initial Farm mongoose object
    const Farm = farm(selectedCompany);
    //find farms to add to farm_permissions
    const foundFarms = await Farm.find({}, { __v: 0 });
    let farmsForFarmPermissions = [];
    for (let i = 0; i < foundFarms.length; i++) {
      farmsForFarmPermissions.push({
        farm_id: foundFarms[i]._id,
        farm_name: foundFarms[i].farm_name,
        permission: false,
      });
    }

    // save for company users collection
    //initial CompanyUser mongoose object
    const CompanyUser = companyUser(selectedCompany);
    const newCompanyUser = new CompanyUser({
      _id: savedUser.id,
      name: registerName,
      surname: registerSurname,
      position: registerPosition,
      farm_permissions: farmsForFarmPermissions,
    });

    //save company user data to company database
    const savedCompanyUser = await newCompanyUser.save();
    return sendResponse(res, true, "User Employee register", null, {
      _id: savedUser.id,
      username: savedCompanyUser.username,
      name: savedCompanyUser.name,
      surname: savedCompanyUser.surname,
      position: savedCompanyUser.position,
      farm_permissions: savedCompanyUser.farm_permissions,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.login = async (req, res) => {
  const requestBody = req.body;
  const loginUsername = requestBody.username; //username for check login
  const loginPassword = requestBody.password; //password for check login
  try {
    //initial User mongoose object
    const User = user();

    //check if user is not existed
    const filter = { username: loginUsername };
    const foundUser = await User.findOne(filter);
    if (!foundUser) {
      return sendResponse(res, false, "Username is not existed", "InvalidUsername", null);
    }

    // check if password is not correct
    const validPassword = await bcrypt.compare(loginPassword, foundUser.password);
    if (!validPassword) {
      return sendResponse(res, false, "Password is not correct", "InvalidPassword", null);
    }

    //get company employee position to put on jsonwebtoken
    const companyName = foundUser.company;
    const CompanyUser = companyUser(companyName);
    const foundCompanyUser = await CompanyUser.findById(foundUser.id, { __v: 0, farm_permissions: 0 });

    //set jsonwebtoken for authentication and authorization
    const authToken = jwt.sign(
      {
        id: foundUser.id,
        company: foundUser.company,
        position: foundCompanyUser.position,
      },
      process.env.SECRET_KEY,
      { expiresIn: tokenExpire }
    );

    //set token to header
    res.header("authorization", authToken);
    return sendResponse(res, true, "login allowed", null, {
      _id: foundCompanyUser.id,
      name: foundCompanyUser.name,
      surname: foundCompanyUser.surname,
      position: foundCompanyUser.position,
      company_name: foundUser.company,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

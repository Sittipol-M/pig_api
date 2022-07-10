const jwt = require("jsonwebtoken");
//////////import send response//////////
const { sendResponse, sendErrorResponse, sendValidationErrorResponse } = require("../sendResponse/sendResponse");

//////////admin section//////////
const { admin } = require("../dbs/mainPigDb/adminsCollection");

//////////user  section//////////
//-> User mongoose model
const { user } = require("../dbs/mainPigDb/usersCollection");

/////////mongoose//////////
var ObjectId = require("mongodb").ObjectId;

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return sendResponse(res, false, "No authorization token", "NoAuthorizationToken", null);
    }
    const authToken = req.headers.authorization;
    const decodedToken = jwt.verify(authToken, process.env.SECRET_KEY);
    req.userAuthData = decodedToken;

    let foundUser;
    if (decodedToken.position === "Admin") {
      //initial Admin mongoose object
      const Admin = admin();
      foundUser = await Admin.findById(decodedToken.id);
    } else {
      //initial User mongoose object
      const User = user();
      foundUser = await User.findById(decodedToken.id);
    }
    if (!foundUser) {
      return sendResponse(res, false, "User is not existed", "UserIsNotExistedByAuth", null);
    }
    return next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return sendResponse(res, false, "login expired", "LoginExpired", null);
    }
    return sendErrorResponse(res, error);
  }
};

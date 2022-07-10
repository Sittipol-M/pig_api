module.exports.hasAdminPermission = hasAdminPermission = (userAuthData) => {
  if (userAuthData.position === "Admin") {
    return true;
  } else {
    return false;
  }
};

module.exports.hasCompanyOwnerPermission = hasCompanyOwnerPermission = (userAuthData) => {
  if (userAuthData.position === "Owner") {
    return true;
  } else {
    return false;
  }
};

module.exports.hasCompanyEmployeePermission = hasCompanyEmployeePermission = (userAuthData) => {
  if (userAuthData.position === "Husbandman" || userAuthData.position === "Veterinarian") {
    return true;
  } else {
    return false;
  }
};

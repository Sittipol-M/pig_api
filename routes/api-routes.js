const router = require("express").Router();

const checkAuth = require("../authentication/checkAuth");

router.get("/", (req, res) => {
  res.send("multidatabase test");
});

const { adminPermission, companyOwnerPermission, employeePermission } = require("../permissions/permissionMiddleware");

//////////Authentication//////////
const AuthenticationController = require("../controllers/AuthenticationController");
//-> admins authentication
router.route("/users/admins/registration").post(AuthenticationController.adminRegister);
router.route("/users/admins/login").post(AuthenticationController.adminLogin);
//-> users authentication//
router.route("/users/userOwners/registration").post(checkAuth, adminPermission, AuthenticationController.OwnerRegister);
router
  .route("/companies/:company_name/users/userEmployees/registration")
  .post(checkAuth, adminPermission, companyOwnerPermission, AuthenticationController.EmployeesRegister);
router.route("/users/login").post(AuthenticationController.login);

//////////company users//////////
const companyUserController = require("../controllers/company/CompanyUserController");
//user
router
  .route("/companies/:company_name/companyUsers")
  .get(checkAuth, adminPermission, companyOwnerPermission, companyUserController.getCompanyUsers);

//companyUser
router
  .route("/companies/:company_name/companyUsers/:companyUser_id")
  .patch(checkAuth, adminPermission, companyOwnerPermission, employeePermission, companyUserController.editCompanyUser)
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, companyUserController.getCompanyUser)
  .delete(checkAuth, adminPermission, companyOwnerPermission, companyUserController.deleteCompanyUser);

//////////farms//////////
const farmController = require("../controllers/company/FarmController");
//farms
router
  .route("/companies/:company_name/farms")
  .post(checkAuth, adminPermission, companyOwnerPermission, farmController.newFarm)
  .get(checkAuth, adminPermission, companyOwnerPermission, farmController.getFarms)
  .delete(checkAuth, adminPermission, companyOwnerPermission, farmController.deleteFarms);

//farm
router
  .route("/companies/:company_name/farms/:farm_id")
  .patch(checkAuth, adminPermission, companyOwnerPermission, farmController.editFarm)
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, farmController.getFarm)
  .delete(checkAuth, adminPermission, companyOwnerPermission, farmController.deleteFarm);

////////////farm permissions//////////
const farmPermissionsController = require("../controllers/company/FarmPermissionController");
router
  .route("/companies/:company_name/companyUsers/:companyUser_id/farmPermissions")
  .get(
    checkAuth,
    adminPermission,
    companyOwnerPermission,
    employeePermission,
    farmPermissionsController.getCompanyUserFarmPermissions
  );

router
  .route("/companies/:company_name/companyUsers/:companyUser_id/farmPermissions/:farm_id")
  .patch(checkAuth, adminPermission, companyOwnerPermission, farmPermissionsController.editCompanyUserFarmPermission);

//////////pig//////////
const PigController = require("../controllers/company/PigController");
//pigs
router
  .route("/companies/:company_name/farms/:farm_id/pigs")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getPigs)
  .post(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.newPig)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deletePigs);
//pig
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getPigs)
  .patch(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.editPig)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deletePig);

//pig vaccinations
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code/vaccinations")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getPigVaccinations)
  .post(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.newPigVaccination)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deletePigVaccinations);
//pig vaccianation
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code/vaccinations/:vaccination_id")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getPigVaccination)
  .patch(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.editPigVaccination)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deletePigVaccination);

//unit vaccination
router
  .route("/companies/:company_name/farms/:farm_id/units/:unit_code/pigs/vaccinations")
  .post(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.newPigsVaccinationUnit);

//////////breeds//////////
//breeds
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code/breeds")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getBreeds)
  .post(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.newBreed)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deleteBreeds);

//breed
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code/breeds/:breed_id")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getBreed)
  .patch(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.editBreed)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deleteBreed);

//newborn
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code/breeds/:breed_id/newBorn")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getNewBorn)
  .patch(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.editNewBorn);
//////////sperms//////////
//sperms
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code/sperms")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getSperms)
  .post(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.newSperm)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deleteSperms);

//sperm
router
  .route("/companies/:company_name/farms/:farm_id/pigs/:rfid_code/sperms/:sperm_id")
  .get(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.getSperm)
  .patch(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.editSperm)
  .delete(checkAuth, adminPermission, companyOwnerPermission, employeePermission, PigController.deleteSperm);

module.exports = router;

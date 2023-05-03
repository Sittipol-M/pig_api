// https://blog.usegravity.app/build-a-single-tenant-saas-app-with-node-js/
// https://backendless.com/docs/rest/users_user_registration.html
// https://medium.com/@prashantramnyc/authenticate-rest-apis-in-node-js-using-jwt-json-web-tokens-f0e97669aad3

const express = require("express");

const dotenv = require("dotenv");

const bodyParser = require("body-parser");

const app = express();

dotenv.config();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const apiRoutes = require("./routes/api-routes");
app.use("/api", apiRoutes);

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("Running on port " + port);
});

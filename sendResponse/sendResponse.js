module.exports.sendResponse = sendResponse = (res, success, message, errorType, data) => {
  res.send({
    success: success,
    message: message,
    error_type: errorType,
    data: data,
  });
};

module.exports.sendErrorResponse = sendErrorResponse = (res, err) => {
  res.send({
    success: false,
    message: err.message,
    error_type: err.name,
    data: {},
  });
};

module.exports.sendValidationErrorResponse = sendValidationErrorResponse = (res, error) => {
  // console.log(error);
  const errMessage = error.details[0].message;
  let errType = error.details[0].type + "." + error.details[0].path;

  if (error.details[0].type === "any.required") {
    return sendResponse(res, false, errMessage, error.details[0].path + "Required", {});
  } else if (error.details[0].type === "string.min") {
    return sendResponse(res, false, errMessage, error.details[0].path + "Minimum", {});
  } else if (error.details[0].type === "string.max") {
    return sendResponse(res, false, errMessage, error.details[0].path + "Maximum", {});
  } else if (error.details[0].type === "string.alphanum") {
    return sendResponse(res, false, errMessage, error.details[0].path + "AlphaNumOnly", {});
  } else if (error.details[0].type === "string.pattern.base") {
    return sendResponse(res, false, errMessage, error.details[0].path + "PatternWrong", {});
  } else if (error.details[0].type === "any.only") {
    return sendResponse(res, false, errMessage, error.details[0].path + "Enum", {});
  } else if (error.details[0].type === "string.empty") {
    return sendResponse(res, false, errMessage, error.details[0].path + "Empty", {});
  } else if (error.details[0].type === "date.base") {
    return sendResponse(res, false, errMessage, error.details[0].path + "DateType", {});
  } else if (error.details[0].type === "array.base") {
    return sendResponse(res, false, errMessage, error.details[0].path + "ArrayType", {});
  }

  // res.send(error);

  sendResponse(res, false, errMessage, errType, {});
};

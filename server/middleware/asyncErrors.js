import ErrorHandler from "./errorHandle.middleware.js";
export const asyncError = (fun) => {
  return (req, res, next) => {
    Promise.resolve(fun(req, res, next)).catch((error) => {
      console.log(error);
      next(new ErrorHandler(error.message, error.statusCode));
    });
  };
};

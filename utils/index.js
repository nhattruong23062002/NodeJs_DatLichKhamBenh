
const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    }, { abortEarly: false });

    return next();
  } catch (err) {
    return res.status(400).json({
      errors: err?.errors,
      type: err.name,
      message: 'Xác thực dữ liệu thất bại',
    });
  }
};

module.exports = {

  validateSchema,


}
var express = require("express");
var router = express.Router();
const passport = require("passport");

const {
  getAll,
  getDetail,
  create,
  remove,
  update,
  login,
  uploadAvatar,
  getAllDoctor,
  forgotPassword,
  resetPassword,
  changePassword,
  getAllPatient,
  getOutstandingDoctor,
  getOutstandingPatient
} = require("./controller");

router.route("/getall-patient").get(getAllPatient);
router.route("/getall-doctor").get(getAllDoctor);
router.route("/outstanding-doctor").get(getOutstandingDoctor);
router.route("/outstanding-patient").get(getOutstandingPatient);

router
  .route("/login")
  .post(passport.authenticate("local", { session: false }), login);

router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router.route("/changePassword/:token").post(changePassword);



router
  .route("/upload-single")
  .post(passport.authenticate("jwt", { session: false }), uploadAvatar);

router.route("/").get(getAll).post(create);

router
  .route("/:id")
  .get(getDetail)
  .patch(/* passport.authenticate('jwt', { session: false }), */ update)
  .delete(passport.authenticate("jwt", { session: false }), remove);

module.exports = router;

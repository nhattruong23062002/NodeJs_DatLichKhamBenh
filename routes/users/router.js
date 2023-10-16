var express = require('express');
var router = express.Router();
const passport = require('passport');

const {
    getAll,
    getDetail,
    create,
    remove,
    update,
    login,
    uploadAvatar,
    getAllDoctor
  } = require("./controller");

router.route("/getall-doctor")
  .get(getAllDoctor)

router.route('/login')
  .post(
    passport.authenticate('local', { session: false }),
    login,
    )

router.route('/upload-single')
  .post(passport.authenticate('jwt', { session: false }),uploadAvatar)

router.route("/")
  .get(getAll)
  .post(passport.authenticate('jwt', { session: false }),create);

router.route("/:id")
  .get(getDetail)
  .patch(passport.authenticate('jwt', { session: false }),update)
  .delete(passport.authenticate('jwt', { session: false }),remove);

module.exports = router;

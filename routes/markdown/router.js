var express = require('express');
var router = express.Router();
const passport = require('passport');

const {
    getAll,
    create,
    remove,
    update
  } = require("./controller");

router.route("/save-info-doctor")
  .post(passport.authenticate('jwt', { session: false }),create);

router.route("/")
  .get(getAll)

router.route("/:id")
  .get(remove)
  .patch(passport.authenticate('jwt', { session: false }),update)

module.exports = router;

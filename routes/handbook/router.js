var express = require('express');
var router = express.Router();

const {
    getAll,
    create,
    remove,
    update,
    getDetail
  } = require("./controller");

router.route("/")
  .get(getAll)
  .post(create);

router.route("/:id")
  .get(getDetail)
  .patch(update)
  .delete(remove);

module.exports = router;

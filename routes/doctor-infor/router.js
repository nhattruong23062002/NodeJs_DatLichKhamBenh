var express = require('express');
var router = express.Router();

const {
    getAll,
    getDetail,
    create,
    remove,
    update,
  } = require("./controller");

router.route("/")
  .get(getAll)
  .post(create)
 

router.route("/:id")
  .get(getDetail)
  .patch(update)
  .delete(remove);

module.exports = router;

var express = require('express');
var router = express.Router();

const {
    getAll,
    getDetail,
    create,
    remove,
    update,
    verifyBook,
    getAllBookingCurrentWeek
  } = require("./controller");

router.route("/getAll-booking-currentWeek")
  .get(getAllBookingCurrentWeek)

router.route("/")
  .get(getAll)
  .post(create);
  
  router.route("/verify-book-appointment")
  .post(verifyBook);
  
router.route("/:id")
  .get(getDetail)
  .patch(update)
  .delete(remove);

module.exports = router;

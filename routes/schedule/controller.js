const { raw } = require("mysql2");
var db = require("../../models/index");
const _ = require("lodash");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { doctorId, date } = req.query;
      doctorNumber = parseInt(doctorId);
      dateNumber = parseInt(date);
      console.log('««««« dateNumber »»»»»', dateNumber);
      
      let results = await db.Schedule.findAll({
        where: { doctorId: doctorNumber, date: dateNumber },
        include: [
          { model: db.Allcode, as: 'timeTypeData' , attributes: ['valueVi']}
        ],
        raw : false,
        nest: true
      });

      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      let found = await db.Schedule.findOne({
        where: { id: id },
        include: [
          { model: db.Allcode, as: 'timeTypeData' , attributes: ['valueVi']}
        ],
        raw : false,
        nest: true
      });

      if (found) {
        return res.send({ code: 200, payload: found });
      }

      return res.status(410).send({ code: 404, message: "Không tìm thấy" });
    } catch (err) {
      res.status(404).json({
        message: "Get detail fail!!",
        payload: err,
      });
    }
  },

  create: async function (req, res, next) {
    try {
      const data = req.body;
      let existing = await db.Schedule.findAll({
        where: { doctorId: data.doctorId, date: data.date },
      });

      if (existing && existing.length > 0) {
        existing = existing.map((item) => {
          item.date = new Date(item.date).getTime();
          return item;
        });
      }

      const toCreate = _.differenceWith(data.result, existing, (a, b) => {
        return a.timeType === b.timeType && a.date === b.date;
      });

      const result = await db.Schedule.bulkCreate(toCreate);

      return res.send({
        code: 200,
        message: "Tạo thành công",
        payload: result,
      });
    } catch (err) {
      console.log("««««« err »»»»»", err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  update: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const found = await db.Schedule.update(updateData, {
        where: { id: id },
      });
      if (found) {
        return res.send({
          code: 200,
          message: "Cập nhật thành công",
          payload: found,
        });
      }

      return res.status(410).send({ code: 400, message: "Không tìm thấy" });
    } catch (error) {
      return res.status(500).json({ code: 500, error });
    }
  },

  remove: async function (req, res, next) {
    try {
      const { id } = req.params;

      let found = await db.Schedule.destroy({
        where: { id: id },
      });

      if (found) {
        return res.send({
          code: 200,
          payload: found,
          message: "Xóa thành công",
        });
      }

      return res.status(410).send({ code: 404, message: "Không tìm thấy" });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },
};

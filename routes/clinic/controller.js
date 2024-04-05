var db = require("../../models/index");
const { Op } = require('sequelize');


module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { name } = req.query;
      const conditionFind = {
        where: {
          name: {
            [db.Sequelize.Op.like]: `%${name}%`,
          },
        },
      };
      let results = await db.Clinic.findAll(conditionFind);

      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      let found = await db.Clinic.findOne({
        where: { id: id },
      });

      let doctorClinic = [];
      doctorClinic = await db.Doctor_Infor.findAll({
        where: { clinicId: id },
      });

      found.doctorClinic = doctorClinic;

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

      const newItem = new db.Clinic(data);

      let result = await newItem.save();

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

      const found = await db.Clinic.update(updateData, {
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

      let found = await db.Clinic.destroy({
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

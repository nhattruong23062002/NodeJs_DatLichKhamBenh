var db = require('../../models/index');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { name = "", page = 1, limit = 10 } = req.query;
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const conditionFind = {
        where: {
          name: {
            [db.Sequelize.Op.like]: `%${name}%`,
          },
        },
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
      };
      let results = await db.Specialty.findAll(conditionFind)
      const total = await db.Specialty.count({
        where: {
          name: {
            [db.Sequelize.Op.like]: `%${name}%`,
          },
        },
      });
  
      return res.send({ code: 200, payload: results, total });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {location} = req.query;
      let found = await db.Specialty.findOne({
        where: {id: id}
      });
      if(found){
        let doctorSpecialty = [];
        if(location === "ALL"){  
          doctorSpecialty = await db.Doctor_Infor.findAll({
            where : {specialtyId : id},
          })
        }else{
          doctorSpecialty = await db.Doctor_Infor.findAll({
            where : {
              specialtyId : id,
              provinceId : location
            },
          })
        }

        found.doctorSpecialty = doctorSpecialty;
      }
  
      if (found) {
        return res.send({ code: 200, payload: found });
      }
  
      return res.status(410).send({ code: 404, message: 'Không tìm thấy' });
    } catch (err) {
      res.status(404).json({
        message: 'Get detail fail!!',
        payload: err,
      });
    }
  },
  
  create: async function (req, res, next) {
    try {
      const data = req.body;

      const newItem = new db.Specialty(data);
  
      let result = await newItem.save();
  
      return res.send({ code: 200, message: 'Tạo thành công', payload: result });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  update: async function (req, res, next) {
    try {
      const { id } = req.params;  
      const updateData = req.body;

      const found = await db.Specialty.update( updateData, {
        where: {id: id}
      });
      if (found) {
        return res.send({
          code: 200,
          message: 'Cập nhật thành công',
          payload: found,
        });
      }
  
      return res.status(410).send({ code: 400, message: 'Không tìm thấy' });
    } catch (error) {
      return res.status(500).json({ code: 500, error });
    }
  },

  remove: async function (req, res, next) {
    try {
      const { id } = req.params;
  
      let found  = await db.Specialty.destroy({
        where: { id: id },
      });
  
      if (found) {
        return res.send({ code: 200, payload: found, message: 'Xóa thành công' });
      }
  
      return res.status(410).send({ code: 404, message: 'Không tìm thấy' });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },


}
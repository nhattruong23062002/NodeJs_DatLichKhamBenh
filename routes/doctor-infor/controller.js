var db = require('../../models/index');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      let results = await db.Doctor_Infor.findAll()
  
      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      let found = await db.Doctor_Infor.findOne({
        where: {id: id},
        include: [
          {model: db.Allcode, as: 'priceData', attributes:['valueVi']},
          {model: db.Allcode, as: 'paymentData', attributes:['valueVi']},
          {model: db.Allcode, as: 'provinceData', attributes:['valueVi']},       
          
        ] ,
        raw: true,
        nest: true,
      });

  
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

      const newItem = new db.Doctor_Infor(data);
  
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

      const found = await db.Doctor_Infor.update( updateData, {
        where: {doctorId: id}
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
  
      let found  = await db.Doctor_Infor.destroy({
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
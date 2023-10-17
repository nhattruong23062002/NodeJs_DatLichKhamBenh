var db = require('../../models/index');
const jwtSettings = require('../../constants/jwtSetting');
const {generateToken} = require('../../helpers/jwtHelper');
const multer = require('multer');
const CRUDService = require('../../services/CRUDService')

const upload = require('../../middlewares/multer');

const {
  insertDocument,
} = require('../../helpers/sequelizeHelper');


module.exports = {
  login: async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await db.User.findOne({ where:{email:email} });

      const token = generateToken(user, jwtSettings.SECRET);

      return res.status(200).json({
        token,
      });
    } catch (err) {
      res.status(400).json({
        statusCode: 400,
        message: 'Looi',
      });
    }
  },

  getAll: async (req, res, next) => {
    try {
      let results = await db.User.findAll({
         include: [
          {model: db.Allcode, as: 'positionData', attributes:['valueVi']},
          {model: db.Allcode, as: 'genderData', attributes:['valueVi']}
        ] ,
        raw: true,
        nest: true,
      })
  
      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      let found = await db.User.findOne({
        where: {id: id},
        include: [
          {model: db.Markdown},
          {model: db.Doctor_Infor,
          include:[
            {model: db.Allcode, as: 'priceData', attributes:['valueVi']},
            {model: db.Allcode, as: 'paymentData', attributes:['valueVi']},
            {model: db.Allcode, as: 'provinceData', attributes:['valueVi']},      
            {model: db.Clinic, as: 'clinicData'},    
          ]
          },
          {model: db.Allcode, as: 'positionData', attributes:['valueVi']},
          {model: db.Allcode, as: 'genderData', attributes:['valueVi']},
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
      let result = await CRUDService.createNewUser(data);
    
  
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

      const found = await db.User.update( updateData, {
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
  
      let found  = await db.User.destroy({
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

  uploadAvatar: async (req, res, next) => upload.single('file')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } else {
        console.log('««««« file »»»»»', req.file);

        const name = req.file.filename;
        const imageUrl = `uploads/media/file/${name}`;


        const response = await insertDocument(
          { location: imageUrl, name},
          'Media',
        );
        res.status(200).json({
          message: 'Tải lên thành công',
          payload: response.result,
        });
      }
    } catch (error) {
      console.log('««««« error »»»»»', error);
      console.log('««««« co chay vo day ma ko hieu sao loi »»»»»');

      res.status(500).json({ ok: false, error });
    }
  }),

  getAllDoctor: async (req, res, next) => {
    try {
      let results = await db.User.findAll({
        where:{roleId: "R2"},
        include: [
          {model: db.Allcode, as: 'positionData', attributes:['valueVi']},
          {model: db.Allcode, as: 'genderData', attributes:['valueVi']},
          {model: db.Doctor_Infor,
            include:[  
              {model: db.Specialty, as: 'specialtyData'},    
            ]}
        ] ,
        raw: true,
        nest: true,
      })
  
      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },



}
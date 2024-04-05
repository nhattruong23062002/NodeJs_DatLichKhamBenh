var db = require("../../models/index");
const jwtSettings = require("../../constants/jwtSetting");
const JWT = require("jsonwebtoken");
const { generateToken } = require("../../helpers/jwtHelper");
const multer = require("multer");
const CRUDService = require("../../services/CRUDService");
const upload = require("../../middlewares/multer");
const { insertDocument } = require("../../helpers/sequelizeHelper");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nhattr2306@gmail.com",
    pass: "mkjtvaunyizktgtp", // Thay thế bằng mật khẩu email của bạn
  },
});

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await db.User.findOne({ where: { email: email } });

      const token = generateToken(user, jwtSettings.SECRET);

      return res.status(200).json({
        token,
      });
    } catch (err) {
      res.status(400).json({
        statusCode: 400,
        message: "Looi",
      });
    }
  },

  getAll: async (req, res, next) => {
    try {
      const { role } = req.query;
      let whereClause = {};
      if (role) {
        whereClause.roleId = role;
      }
      let results = await db.User.findAll({
        where: whereClause,
        include: [
          { model: db.Allcode, as: "positionData", attributes: ["valueVi"] },
          { model: db.Allcode, as: "genderData", attributes: ["valueVi"] },
        ],
        raw: true,
        nest: true,
      });

      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      let found = await db.User.findOne({
        where: { id: id },
        include: [
          { model: db.Markdown },
          {
            model: db.Doctor_Infor,
            include: [
              { model: db.Allcode, as: "priceData", attributes: ["valueVi"] },
              { model: db.Allcode, as: "paymentData", attributes: ["valueVi"] },
              {
                model: db.Allcode,
                as: "provinceData",
                attributes: ["valueVi"],
              },
              { model: db.Clinic, as: "clinicData" },
            ],
          },
          { model: db.Allcode, as: "positionData", attributes: ["valueVi"] },
          { model: db.Allcode, as: "genderData", attributes: ["valueVi"] },
        ],
        raw: true,
        nest: true,
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
      console.log("««««« data »»»»»", data);
      let result = await CRUDService.createNewUser(data);

      return res.send({
        code: 200,
        message: "Tạo thành công",
        payload: result,
      });
    } catch (err) {
      console.log("««««« err »»»»»", err.message);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  update: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const found = await db.User.update(updateData, {
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

      let found = await db.User.destroy({
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

  uploadAvatar: async (req, res, next) =>
    upload.single("file")(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          res.status(500).json({ type: "MulterError", err: err });
        } else if (err) {
          res.status(500).json({ type: "UnknownError", err: err });
        } else {
          console.log("««««« file »»»»»", req.file);

          const name = req.file.filename;
          const imageUrl = `uploads/media/file/${name}`;

          const response = await insertDocument(
            { location: imageUrl, name },
            "Media"
          );
          res.status(200).json({
            message: "Tải lên thành công",
            payload: response.result,
          });
        }
      } catch (error) {
        console.log("««««« error »»»»»", error);
        console.log("««««« co chay vo day ma ko hieu sao loi »»»»»");

        res.status(500).json({ ok: false, error });
      }
    }),

  getAllDoctor: async (req, res, next) => {
    try {
      const { name } = req.query;
      let results = await db.User.findAll({
        where: {
          roleId: "R2",
          lastName: {
            [db.Sequelize.Op.like]: `%${name}%`,
          },
        },
        include: [
          { model: db.Allcode, as: "positionData", attributes: ["valueVi"] },
          { model: db.Allcode, as: "genderData", attributes: ["valueVi"] },
          {
            model: db.Doctor_Infor,
            include: [{ model: db.Specialty, as: "specialtyData" }],
          },
        ],
        raw: true,
        nest: true,
      });

      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      // Tìm kiếm nhân viên dựa vào email
      const user = await db.User.findOne({ where: { email: email } });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: "Không tìm thấy người dùng với email đã cung cấp.",
        });
      }

      // Tạo mã token duy nhất
      const token = generateToken({ email: user.email }, jwtSettings.SECRET, {
        expiresIn: "15m",
      });
      // Gửi email chứa URL đặt lại mật khẩu
      const mailOptions = {
        from: "nhattr23062@gmail.com", // Thay thế bằng email của bạn
        to: user.email,
        subject: "Yêu cầu đặt lại mật khẩu",
        html: `
          <p>Xin chào,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu từ HealthCare.Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
          <p><a href="http://localhost:3000/resetPassword?token=${token}">Đặt lại mật khẩu</a></p>
          <p>Trân trọng,</p>
          <p>Đội ngũ của chúng tôi</p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
          return res.status(500).json({
            statusCode: 500,
            message: "Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.",
          });
        }
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          statusCode: 200,
          message:
            "Một email chứa liên kết đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn.",
        });
      });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({
        statusCode: 500,
        message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { token, password } = req.body;

      // Giải mã token để lấy email của người dùng
      const decodedToken = JWT.verify(token, jwtSettings.SECRET);
      const email = decodedToken.email;

      // Tìm kiếm người dùng dựa vào email
      const user = await db.User.findOne({ where: { email: email } });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: "Không tìm thấy người dùng với email đã cung cấp.",
        });
      }
      console.log("««««« user »»»»»", user);

      // Cập nhật mật khẩu mới cho người dùng
      let newPassWord = await CRUDService.hasUserPassword(password);
      await db.User.update(
        { password: newPassWord },
        { where: { email: email } }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Mật khẩu đã được đặt lại thành công.",
      });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({
        statusCode: 500,
        message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { token } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Giải mã token để lấy email của người dùng
      const decodedToken = JWT.verify(token, jwtSettings.SECRET);
      const email = decodedToken.email;

      // Tìm kiếm người dùng dựa vào email
      const user = await db.User.findOne({ where: { email: email } });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: "Không tìm thấy người dùng với email đã cung cấp.",
        });
      }

      // Kiểm tra mật khẩu hiện tại của người dùng
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          statusCode: 401,
          message: "Mật khẩu hiện tại không đúng.",
        });
      }

      // Cập nhật mật khẩu mới cho người dùng
      await db.User.update(
        { password: newPassword },
        { where: { email: email } }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Mật khẩu đã được thay đổi thành công.",
      });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({
        statusCode: 500,
        message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    }
  },

  getAllDoctor: async (req, res, next) => {
    try {
      const { name } = req.query;
      let results = await db.User.findAll({
        where: {
          roleId: "R2",
          lastName: {
            [db.Sequelize.Op.like]: `%${name}%`,
          },
        },
        include: [
          { model: db.Allcode, as: "positionData", attributes: ["valueVi"] },
          { model: db.Allcode, as: "genderData", attributes: ["valueVi"] },
          {
            model: db.Doctor_Infor,
            include: [{ model: db.Specialty, as: "specialtyData" }],
          },
        ],
        raw: true,
        nest: true,
      });

      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getAllPatient: async (req, res, next) => {
    try {
      let results = await db.User.findAll({
        where: {
          roleId: "R3",
        },
        include: [
          { model: db.Allcode, as: "positionData", attributes: ["valueVi"] },
          { model: db.Allcode, as: "genderData", attributes: ["valueVi"] },
        ],
        raw: true,
        nest: true,
      });

      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getOutstandingDoctor: async (req, res, next) => {
    try {
      let results = await db.Booking.findAll({
        attributes: [
          "doctorId",
          [db.sequelize.fn("COUNT", "*"), "bookingCount"],
        ],
        group: ["doctorId"],
        order: [[db.sequelize.literal("bookingCount"), "DESC"]],
        limit: 5,
        raw: true,
      });

      let doctorIds = results.map((result) => result.doctorId);

      let doctors = await db.User.findAll({
        where: { id: doctorIds },
        include: [
          { model: db.Allcode, as: "positionData", attributes: ["valueVi"] },
          { model: db.Allcode, as: "genderData", attributes: ["valueVi"] },
          {
            model: db.Doctor_Infor,
            include: [{ model: db.Specialty, as: "specialtyData" }],
          },
        ],
        raw: true,
        nest: true,
      });

      // Thêm số lần đặt lịch vào kết quả
      let topDoctors = results.map((result) => {
        let doctor = doctors.find((doctor) => doctor.id === result.doctorId);
        return {
          ...doctor,
          bookingCount: result.bookingCount,
        };
      });

      return res.send({ code: 200, payload: topDoctors });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getOutstandingPatient: async (req, res, next) => {
    try {
      let results = await db.Booking.findAll({
        attributes: [
          "patientId",
          [db.sequelize.fn("COUNT", "*"), "bookingCount"],
        ],
        group: ["patientId"],
        order: [[db.sequelize.literal("bookingCount"), "DESC"]],
        limit: 5,
        raw: true,
      });

      let patientIds = results.map((result) => result.patientId);
      console.log("««««« patientIds »»»»»", patientIds);

      let topPatients = await Promise.all(
        patientIds.map(async (patientId) => {
          let doctorIdsArr = await db.Booking.findAll({
            where: { patientId },
            attributes: ["doctorId"],
            raw: true,
          });
          let doctorIds = doctorIdsArr.map((booking) => booking.doctorId);

          let priceIds = await Promise.all(
            doctorIds.map(async (doctorId) => {
              let doctorInfo = await db.Doctor_Infor.findOne({
                where: { doctorId },
                attributes: ["priceId"],
                raw: true,
              });
              return doctorInfo ? doctorInfo.priceId : null;
            })
          );

          let totalPrice = 0;
          for (let i = 0; i < priceIds.length; i++) {
            let priceId = priceIds[i];
            let priceInfo = await db.Allcode.findOne({
              where: { keyMap: priceId },
              raw: true
            });
            if (priceInfo) {
              totalPrice += parseInt(priceInfo.valueVi);
            }
          }
    

          let patient = await db.User.findOne({
            where: { id: patientId },
            include: [
              {
                model: db.Allcode,
                as: "positionData",
                attributes: ["valueVi"],
              },
              { model: db.Allcode, as: "genderData", attributes: ["valueVi"] },
            ],
            raw: true,
          });

          return {
            ...patient,
            bookingCount: results.find(
              (result) => result.patientId === patientId
            ).bookingCount,
            totalPrice,
          };
        })
      );

      return res.send({ code: 200, payload: topPatients });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },
};

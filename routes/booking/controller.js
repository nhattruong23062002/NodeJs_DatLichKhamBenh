const { generateToken } = require("../../helpers/jwtHelper");
var db = require("../../models/index");
const nodemailer = require("nodemailer");
const jwtSettings = require("../../constants/jwtSetting");
const moment = require("moment");
const { Op } = require('sequelize');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nhattr2306@gmail.com", // Thay thế bằng email của bạn để gửi yêu cầu đặt lại mật khẩu
    pass: "mkjtvaunyizktgtp", // Thay thế bằng mật khẩu email của bạn
  },
});

module.exports = {
  getAll: async (req, res, next) => {
    const { doctorId, date, status } = req.query;
    dateNumber = parseInt(date);

    try {
      let results = await db.Booking.findAll({
        where: { statusId: status, doctorId: doctorId, date: dateNumber },
        include: [
          { model: db.User, as: "patientData" },
          { model: db.Allcode, as: "timeTypeDataPatient" },
        ],
        raw: false,
        nest: true,
      });
      return res.send({ code: 200, payload: results });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getAllBookingCurrentWeek: async (req, res, next) => {
    try {
      const startOfWeek = moment()
        .startOf("isoWeek")
        .isoWeekday(1)
        .format("YYYY-MM-DD 17:00:00.000Z");
      const endOfWeek = moment()
        .endOf("isoWeek")
        .isoWeekday(7)
        .format("YYYY-MM-DD 17:00:00.000Z");

      let results = await db.Booking.findAll({
        where: {
          date: {
            [Op.between]: [startOfWeek, endOfWeek]
          }
        },
        attributes: [
          [db.sequelize.fn('DAYOFWEEK', db.sequelize.col('date')), 'dayOfWeek'],
          [db.sequelize.fn('COUNT', db.sequelize.col('*')), 'totalBooking']
        ],
        group: 'dayOfWeek',
        raw: true
      });

      const bookingCountsForWeek = Array(7).fill(0).map((_, index) => {
        const result = results.find(item => parseInt(item.dayOfWeek) === index + 1);
        return { date: index.toString(), totalBooking: result ? result.totalBooking : 0 };
      });
  
      return res.send({ code: 200, payload: bookingCountsForWeek });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      let found = await db.Booking.findOne({
        where: { id: id },
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
      const token = generateToken(
        { email: "hoa@gmail.com" },
        jwtSettings.SECRET,
        { expiresIn: "15m" }
      );

      const newItem = new db.Booking(data);
      newItem.token = token;
      let result = await newItem.save();
      // Gửi email chứa URL đặt lại mật khẩu
      const mailOptions = {
        from: "nhattr2306@gmail.com", // Thay thế bằng email của bạn
        to: "nhattr23062@gmail.com",
        subject: "Thông tin đặt lịch khám bệnh",
        html: `
          <p>Xin chào ${data.patientFirstName} ${data.patientLastName}!</p>
          <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên HealthCare</p>
          <p>Thông tin đặt lịch khám bệnh:</p>
          <div><b>Thời gian: ${data.timeTypeValue} - ${data.dayName} - ${data.day}/${data.month}/${data.year}</b></div>
          <div><b>${data.doctorPosition}: ${data.doctorFirstName} ${data.doctorLastName}</b></div>
          <p>Nếu thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh</p>
          <a href="http://localhost:3000/verify-booking?token=${token}&doctorId=${data.doctorId}">Click here </a>
          <p>Xin chân thành cảm ơn</p>
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

  verifyBook: async function (req, res, next) {
    try {
      const data = req.body;

      let newItem = await db.Booking.update(
        { statusId: "S2" }, // Dữ liệu cần cập nhật
        {
          where: { doctorId: data.doctorId, token: data.token },
        }
      );
      return res.send({
        code: 200,
        message: "Tạo thành công",
        payload: newItem,
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

      const found = await db.Booking.update(updateData, {
        where: { id: id },
      });

      if (updateData.statusId === "S3") {
        const mailOptions = {
          from: "nhattr2306@gmail.com", // Thay thế bằng email của bạn
          to: "nhattr23062@gmail.com",
          subject: "Kết quả đặt lịch khám bệnh",
          html: `
            <p>Xin chào!</p>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên HealthCare thành công</p>
            <p>Thông tin pháp đồ điệu trị và những lưu ý khi đi khám được gửi trong file đính kèm</p>
            <p>Xin chân thành cảm ơn</p>
            `,
          attachments: [],
        };

        if (updateData.fileName) {
          mailOptions.attachments.push({
            filename: "your-image.jpg",
            path: `http://localhost:3333/${updateData.fileName}`,
          });
        }

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
      }

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

      let found = await db.Booking.destroy({
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

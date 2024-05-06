const { generateToken } = require("../../helpers/jwtHelper");
var db = require("../../models/index");
const nodemailer = require("nodemailer");
const jwtSettings = require("../../constants/jwtSetting");
const moment = require("moment");
const { Op } = require("sequelize");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nhattr2306@gmail.com", // Thay thế bằng email của bạn để gửi yêu cầu đặt lại mật khẩu
    pass: "mkjtvaunyizktgtp", // Thay thế bằng mật khẩu email của bạn
  },
});

function sendEmailMedicalExaminationInformation(emailAddress) {
  const mailOptions = {
    from: "nhattr2306@gmail.com",
    to: "nhattr23062@gmail.com",
    subject: "Thông tin đi khám bệnh",
    html: `
      <p>Xin chào!</p>
      <p>Bạn nhận được email này vì đã xác nhận đặt lịch khám bệnh online trên HealthCare thành công</p>
      <p>Thông tin pháp đồ điệu trị và những lưu ý khi đi khám được gửi trong file đính kèm</p>
      <p>Xin chân thành cảm ơn</p>
    `,
    attachments: [
      {
        filename: "your-image.jpg",
        path: `https://bachmai.gov.vn/documents/37204/0/z4515220187066_9d44ab590b5544bfa3c00d9b9834ec0d.jpg/9806f9f8-f3f3-ba9a-6623-7939a473ad5c?t=1689412249750`,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

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
            [Op.between]: [startOfWeek, endOfWeek],
          },
        },
        attributes: [
          [db.sequelize.fn("DAYOFWEEK", db.sequelize.col("date")), "dayOfWeek"],
          [db.sequelize.fn("COUNT", db.sequelize.col("*")), "totalBooking"],
        ],
        group: "dayOfWeek",
        raw: true,
      });

      const bookingCountsForWeek = Array(7)
        .fill(0)
        .map((_, index) => {
          const result = results.find(
            (item) => parseInt(item.dayOfWeek) === index + 1
          );
          return {
            date: index.toString(),
            totalBooking: result ? result.totalBooking : 0,
          };
        });

      return res.send({ code: 200, payload: bookingCountsForWeek });
    } catch (err) {
      console.log("««««« err »»»»»", err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  getHistoryBooking: async (req, res, next) => {
    try {
      const { patientId } = req.query;

      if (!patientId) {
        return res
          .status(400)
          .json({ code: 400, error: "Patient ID is required" });
      }

      let bookingHistory = await db.Booking.findAll({
        where: { patientId },
        include: [
          {
            model: db.Allcode,
            as: "statusDataPatient",
            attributes: ["valueVi"],
          },
          {
            model: db.Schedule,
            as: "scheduleData",
            attributes: ["date"],
          },
          {
            model: db.Allcode,
            as: "timeTypeDataPatient",
            attributes: ["valueVi"],
          },
          {
            model: db.User,
            as: "doctorData",
            attributes: ["firstName", "lastName"],
            where: { id: db.sequelize.col("Booking.doctorId") },
            include: [
              {
                model: db.Allcode,
                as: "positionData",
                attributes: ["valueVi"],
              },
            ],
            required: true,
          },
          {
            model: db.Doctor_Infor,
            as: "doctorDataInfo",
            attributes: ["clinicId"],
            where: { id: db.sequelize.col("Booking.doctorId") },
            required: true,
            include: [
              {
                model: db.Clinic,
                attributes: ["name"],
                as: "clinicData",
              },
              {
                model: db.Allcode,
                as: "priceData",
                attributes: ["valueVi"],
              },
            ],
          },
        ],
        raw: true,
      });

      return res.send({ code: 200, payload: bookingHistory });
    } catch (err) {
      console.error("Error in getHistoryBooking:", err);
      return res
        .status(500)
        .json({ code: 500, error: "Internal server error" });
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
        { email: `${data.emailUser}` },
        jwtSettings.SECRET,
        { expiresIn: "15m" }
      );

      const newItem = await db.Booking.create(data);
      newItem.token = token;
      let result = await newItem.save();

      const scheduleData = await db.Schedule.findOne({
        where: { id: data.scheduleId },
      });
      if (!scheduleData) {
        return res
          .status(404)
          .json({ code: 404, message: "Không tìm thấy lịch trình" });
      }

      const updated = await db.Schedule.update(
        { currentNumber: scheduleData.currentNumber + 1 },
        { where: { id: scheduleData.id } }
      );

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
          <a href="https://react-js-do-an-dat-lich-kham-benh.vercel.app/verify-booking?token=${token}&doctorId=${data.doctorId}&email=${data.emailUser}">Click here </a>
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

      let emailSent = false; // Biến để đánh dấu liệu email đã được gửi hay chưa
      if (newItem && !emailSent) {
        setTimeout(async () => {
          await sendEmailMedicalExaminationInformation(data.email);
          emailSent = true;
        }, 60000);
      }

      if (newItem) {
        setTimeout(async () => {
          await sendEmailMedicalExaminationInformation(data.email);
        }, 60000);
      }

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

      console.log("««««« updateData »»»»»", updateData);

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
            <p>Chúng tôi muốn gửi lời cảm ơn chân thành đến bạn đã đến khám bệnh tại chúng tôi</p>
            <p>Chúng tôi rất trân trọng sự tin tưởng và lựa chọn của bạn vào dịch vụ chăm sóc sức khỏe của chúng tôi. Với sứ mệnh mang lại dịch vụ chăm sóc tốt nhất và đảm   bảo sức khỏe của bạn, chúng tôi luôn sẵn lòng hỗ trợ bạn mọi lúc.
            </p>
            <p>Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào khác, đừng ngần ngại liên hệ với chúng tôi. Chúng tôi rất mong được phục vụ bạn một lần nữa trong tương lai gần.</p>
            <p>Thông tin về hóa đơn và những kêt quả khám được gửi trong file đính kèm</p>
            <p>Xin chân thành cảm ơn</p>
            `,
          attachments: [],
        };

        if (updateData.fileName) {
          mailOptions.attachments.push({
            filename: "your-image.jpg",
            path: `https://nodejs-datlichkhambenh-1.onrender.com/${updateData.fileName}`,
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

      if (updateData.role === "doctor") {
        const mailOptions = {
          from: "nhattr2306@gmail.com",
          to: "nhattr23062@gmail.com",
          subject: "Thông báo lịch hẹn bị hủy",
          html: `
            <p>Xin chào!</p>
            <p>Chúng tôi muốn gửi lời xin lỗi chân thành đến bạn vì lịch hẹn của bạn đã bị hủy</p>
            <p>Chúng tôi rất tiếc vì sự bất tiện này và hiểu rằng việc thay đổi lịch hẹn có thể gây ra không thoải mái cho bạn. Vì một lý do đột xuất ngoài ý muốn nên bác sĩ không thể tiếp nhận lịch khám trong khoảng thời gian bạn đã đặt lịch , và chúng tôi đang nỗ lực để đảm bảo rằng điều này sẽ không xảy ra lần nữa trong tương lai.
            </p>
            <p>Nếu bạn vẫn muốn đặt lịch khám thì có thể tham khảo những khung giờ khác. Nếu có bất kỳ câu hỏi nào có thể liên hệ với chúng tôi.</p>
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

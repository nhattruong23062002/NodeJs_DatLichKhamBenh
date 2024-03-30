'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookings', 'scheduleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Schedules', // Tên bảng mà trường 'scheduleId' tham chiếu đến
        key: 'id',          // Tên trường trong bảng 'Schedule' mà 'scheduleId' tham chiếu đến
      },
      onUpdate: 'CASCADE',  // Tùy chọn để cập nhật các giá trị tham chiếu khi bảng 'Schedule' thay đổi
      onDelete: 'SET NULL', // Tùy chọn để đặt giá trị 'scheduleId' là null khi bảng 'Schedule' bị xóa
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookings', 'scheduleId');
  }
};

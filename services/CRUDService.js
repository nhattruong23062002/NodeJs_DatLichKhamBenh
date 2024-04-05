const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
var db = require('../models/index');

let createNewUser = async(data) => {
    return new Promise(async(resolve,reject) => {
        try {
            let hashPasswordFromBcrypt = await hasUserPassword(data.password);
            const result = await db.User.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                address: data.address,
                phoneNumber: data.phoneNumber,
                image: data.image,
                gender:data.gender,
                password: hashPasswordFromBcrypt,
                positionId: data.positionId,
                roleId: data.roleId,
            })
            resolve(result);
        } catch (e) {
            reject(e);
        }
    })
}

let hasUserPassword = (password) => {
    return new Promise(async(resolve,reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password,salt);
            resolve(hashPassword)

        } catch (e) {
            reject(e);
        }
    })
}

let isValidPassword = async (user, password) => {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw error;
    }
  };
module.exports = {
    createNewUser,
    hasUserPassword,
    isValidPassword
} 
'use strict';
const path = require('path');
const { sequelize } = require('../models');

// INSERT: Thêm mới (một)
function insertDocument(data, collectionName) {
  return new Promise((resolve, reject) => {
    sequelize.model(collectionName)
      .create(data)
      .then((result) => {
        resolve({ result: result });
      })
      .catch((err) => {
        reject(err);
      });
  });
}


function toSafeFileName(fileName) {
  const fileInfo = path.parse(fileName);

  const safeFileName = fileInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + fileInfo.ext;
  return `${Date.now()}-${safeFileName}`;
}

module.exports = { insertDocument, toSafeFileName };

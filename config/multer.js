const multer = require('multer');
const path = require('path');
// const storage = multer.diskStorage({});
const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, path.join(__dirname, '/tmp'));
  // },
  filename: function (req, file, cb) {
    const fileName = file.originalname.match(/\w+/g).join('');
    cb(null, fileName);
  },
});
module.exports = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Lọc file trước khi tải lên
    const allowedMimeTypes = [
      'audio/wav',
      'audio/mp3',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mpeg',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/jpe',
      'image/gif',
    ];
    //   !file.mimetype.match(/jpe|jpeg|png|gif|jpg$i/) ||

    if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(new Error('File is not supported'), false);
      return;
    }

    cb(null, true);
  },
});

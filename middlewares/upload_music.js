const multer = require("multer");

// upload music for add music
module.exports = (music) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/music");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const fileFilter = function (req, file, cb) {
    if (file.fieldname === music) {
      if (!file.originalname.match(/\.(mp3)$/)) {
        req.fileValidationError = {
          message: "Only mp3 files are allowed",
        };

        return cb(new Error("Only mp3 files are allowed", false));
      }
    }

    cb(null, true);
  };

  const sizeMB = 10;
  const maxSize = sizeMB * 1024 * 1024;

  //upload function
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  }).single(music);

  return (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
          req.session.message = {
            type: "danger",
            message: "Error, max file size is 10MB",
          };
          return res.redirect(req.originalUrl);
        }

        req.session.message = {
          type: "danger",
          message: "upload file error",
        };
        return res.redirect(req.originalUrl);
      }
      return next();
    });
  };
};
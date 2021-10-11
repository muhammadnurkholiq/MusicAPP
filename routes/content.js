const dbConnection = require("../connection/db");
const router = require("express").Router();

const upload_artist = require("../middlewares/upload_artist");
const upload_music = require("../middlewares/upload_music");


// render add artist page
router.get("/add-artist", function (req, res) {
  res.render("content/add-artist", { title: "Add Artist", isLogin: true, css : "/static/css/auth.css" });
});

router.post("/add-artist", upload_artist("image"), function (req, res) {
  let { name, start_career, about } = req.body;
  let image = req.file.filename;


  const query = "INSERT INTO tb_artist (name, start_career, photo, about) VALUES (?,?,?,?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name, start_career, image, about ], (err, result) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "server error",
        };
        return res.redirect("/content/add-music");
      } else {
        req.session.message = {
          type: "success",
          message: "add artist successfully",
        };

        return res.redirect("/");
      }
    });
    conn.release();
  });
});


// render add music page
router.get("/add-music", function (req, res) {
  res.render("content/add-music", { title: "Add Music", isLogin: true, css : "/static/css/auth.css"});
});

router.post("/add-music", upload_music("music"), function (req, res) {
  let { title } = req.body;
  let music = req.file.filename;

  const query = "INSERT INTO tb_music (title, music) VALUES (?,?)";

  dbConnection.getConnection((err, conn) => {
    if (err)throw err;

    conn.query(query, [title, music ], (err, result) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "server error",
        };
        return res.redirect("/content/add-music");        
      } else {
        req.session.message = {
          type: "success",
          message: "add music successfully",
        };
        res.redirect("/");
      }
    });
    conn.release();
  });
});

// handle delete music
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_music WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/");
      }

      req.session.message = {
        type: "success",
        message: "music successfully deleted",
      };
      res.redirect("/");
    });

    conn.release();
  });
});

// handle edit music
router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  if (!req.session.isLogin) {
    req.session.message = {
      type: "danger",
      message: "you must login first",
    };

    return res.redirect("/login");
  }

  const query = "SELECT * FROM tb_music WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      let music = []
      for (let result of results) {
        music.push({
          ...result,
          music: "/uploads/music/" + result.music,
          });
        }

      req.session.message = {
        type: "success",
        message: "edit music successfully",
      };
      res.render("content/form-edit", {
        title: "Edit Music",
        isLogin: req.session.isLogin,
        css : "/static/css/auth.css",
        music
      });
    });

    conn.release();
  });
});

router.post("/edit/:id", upload_music("music"), function (req, res) {
  let { id, title, music } = req.body;
  
  if (req.file) {
    music = req.file.filename;
  }

  const query = "UPDATE tb_music SET title = ?, music = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [title, music, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "server error",
        };
        return res.redirect("/");        
      } else {
        req.session.message = {
          type: "success",
          message: "edit music successfully",
        };
        res.redirect("/");
      }
    });

    conn.release();
  });
});

module.exports = router;
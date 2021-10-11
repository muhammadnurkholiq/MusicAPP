const http = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const hbs = require("hbs");

const authRoute = require("./routes/auth");
const contentRoute = require("./routes/content")

// import db connection
const dbConnection = require("./connection/db");

app.use(express.static('express'))
app.use(express.urlencoded({extended: false}))

// app.use(express.static('express'))
app.use("/static", express.static(path.join(__dirname, "public")));

// app.use(express.static('express'))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// set views location
app.set("views", path.join(__dirname, "views"))

// set template/ view engine 
app.set("view engine", "hbs")

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"))

// use flash for sending message
const flash = require("express-flash");

app.use(session({
    cookie : {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false,
        httpOnly: true
    },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: "secretValue"
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// render content artist
app.get("/", function (req, res) {
    const query = "SELECT tb_artist.name, tb_artist.start_career, tb_artist.photo, tb_artist.about, tb_music.id AS music_id, tb_music.title AS music_title, tb_music.music FROM tb_artist INNER JOIN tb_music;";
    
    dbConnection.getConnection((err, conn) => {
      if (err)throw err;
  
      conn.query(query, (err, results) => {
        if (err) throw err;
  
        let content = [];
  
        for (let result of results) {
        content.push({
            ...result,
            image: "/uploads/image/" + result.photo,
            music: "/uploads/music/" + result.music,
            });
        }
  
        res.render("index.hbs", {title: "MusicAPP", isLogin: req.session.isLogin, css : "/static/css/index.css", content})
      });
    });
});

// mount auth route
app.use("/", authRoute);
app.use("/content",  contentRoute);

const server = http.createServer(app)
const port = 4000;
server.listen(port, () => {
    console.log('server running on port '+port)
})
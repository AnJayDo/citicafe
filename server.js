const express = require('express')
const app = express()

// const multipart = require('connect-multiparty')
const fs = require('fs')
const md5 = require('md5')
const bodyParser = require('body-parser')
const multer = require('multer')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const slug = require('vietnamese-slug');
// const multipartMiddleware = multipart()
const PORT = process.env.PORT || 3000
 
const adminRouter = require('./routers/adminRouter')

const Post = require('./models/Post.model')

require('dotenv').config()
mongoose.connect(process.env.MONGO, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("Mongo Connection is success.")
}).catch(error => handleError(error));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/posts')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()
      cb(null, uniqueSuffix + '-' + file.originalname)
    }
  })
const upload = multer({ storage: storage })

const auth = (req, res, next) => {
    if (req._parsedOriginalUrl.href.indexOf('login') > 0) {
        const token = req.cookies.token
        if (token !== md5("kienlua" + "123123")) {
            next()
        } else if(req._parsedOriginalUrl.href=='/admin') next()
        else res.redirect('/admin')
    }
    else try {
        const token = req.cookies.token
        if (token == md5("kienlua" + "123123")) {
            next()
        } else {
            res.redirect('/admin/login')
        }
    } catch (e) {
        res.redirect('/admin/login')
    }
}

app.set("view engine", "ejs")
app.set("views", "./views")

app.use(cookieParser())
app.use(session({
    secret: "secret",
	resave: true,
    saveUninitialized: true,
    cookie: {}
}))
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.static("./public"))

app.get("/", (req, res) => {
    res.render("index")
})
app.get("/blog", async (req, res) => {
    const posts = await Post.find()
    res.render("blog", {posts: posts})
})
app.use("/admin", auth, adminRouter)
app.get("/api/:id", async (req, res) => {
    Post.findOne({_id:req.params.id}).then(post => {
        res.json(post)
    })
})
app.post("/api/edit/:id", upload.single('thumbnail'), (req,res) => {
    req.body.slug= slug(req.body.title)
    req.body.tags= req.body.tags.trim().split("#")
    if(req.file) {
        req.body.thumbnail = replaceAllBackslash(req.file.path.replace("public",""))
    }
    Post.findByIdAndUpdate({_id: req.params.id}, req.body).then(() => {
        res.render("admin/thanhcong")
    }).catch((err) => {
        console.log(err)
        res.render("admin/thatbai")
    })                
})
app.post("/api/create", upload.single('thumbnail'), (req,res) => {
    req.body.slug= slug(req.body.title)
    req.body._id= new mongoose.Types.ObjectId
    req.body.tags= req.body.tags.trim().split("#")
    if(req.file) {
        req.body.thumbnail = replaceAllBackslash(req.file.path.replace("public",""))
    }
    const post = new Post(req.body)
    post.save().then(() => {
        res.render("admin/thanhcong")
    }).catch((err) => {
        console.log(err)
        res.render("admin/thatbai")
    })                
})
app.delete("/api/delete/:id", upload.single('thumbnail'), (req,res) => {
    Post.findOneAndDelete({_id: req.params.id}).then(() => {
        res.json({status: "Thành công"})
    }).catch((err) => {
        console.log(err)
        res.json({status: "Thất bại"})
    })                
})

app.listen(PORT, () => {
    console.log("Server is running on port "+PORT)
})

function replaceAllBackslash(item) {
    while(item.indexOf("\\")>=0) {
        item=item.replace("\\","/")
    }
    return item
}
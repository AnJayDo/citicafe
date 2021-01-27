const router = require('express').Router()
const md5 = require('md5')

const Post = require('../models/Post.model')

router.get('/', (req, res) => {
    res.render("adminPage")
})
router.get("/login", (req, res) => {
    res.render("loginAdmin")
})
router.post("/login", (req, res) => {
    if (req.body.username == "kienlua" && req.body.password == "123123") {
        let options = {
            maxAge: 1000 * 60 * 60 * 24 * 7, // would expire after 15 minutes
        }
        res.cookie('token', md5(req.body.username + req.body.password), options)
        res.redirect("/admin")
    }
})
router.post("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/admin/login")
})
router.get("/posts", async (req, res) => {
    const posts = await Post.find()
    res.render("admin/posts", {posts: posts})
})
router.get("/vietbai", (req, res) => {
    res.render("admin/vietbai")
})
router.get("/edit/:slug", async (req, res) => {
    const editPost = await Post.findOne({slug: req.params.slug})
    res.render("admin/suabai", {post: editPost})
})
router.get("/edit/:id", async (req, res) => {
    const editPost = await Post.findOne({_id: req.params.id})
    res.render("admin/suabai", {post: editPost})
})
router.get("/thanhcong", (req, res) => {
    res.render("admin/thanhcong")
})
router.get("/thatbai", (req, res) => {
    res.render("admin/thatbai")
})


module.exports = router


// app.post("/upload", multipartMiddleware, (req, res) => {
//     try {
//         fs.readFile(req.files.upload.path, function (err, data) {
//             var newPath = __dirname + '/public/images/' + req.files.upload.name;
//             fs.writeFile(newPath, data, function (err) {
//                 if (err) console.log({err: err});
//                 else {
//                     console.log(req.files.upload.originalFilename);
//                 //     imgl = '/images/req.files.upload.originalFilename';
//                 //     let img = "<script>window.parent.CKEDITOR.tools.callFunction('','"+imgl+"','ok');</script>";
//                 //    res.status(201).send(img);
                 
//                     let fileName = req.files.upload.name;
//                     let url = '/images/'+fileName;                    
//                     let msg = 'Upload successfully';
//                     let funcNum = req.query.CKEditorFuncNum;
//                     console.log({url,msg,funcNum});
                   
//                     res.status(201).send("<script>window.parent.CKEDITOR.tools.callFunction('"+funcNum+"','"+url+"','"+msg+"');</script>");
//                 }
//             });
//         });
//        } catch (error) {
//            console.log(error.message);
//        }
// })
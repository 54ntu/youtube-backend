const multer = require('multer');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp"); 

    },

    filename:function(req,file,cb){
        let imageName = Date.now() + file.originalname;
        cb(null,imageName);
    }
}
)

const upload = multer({storage:storage});
module.exports = {upload};
import multer from "multer"

// Using memory storage is often easier if you are sending the buffer to Cloudinary
// Or keep diskStorage but ensure the backend doesn't crash on empty objects
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ storage })

export default upload;

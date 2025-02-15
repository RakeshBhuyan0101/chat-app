import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory (can be optimized)
const upload = multer({ storage });

export default upload;
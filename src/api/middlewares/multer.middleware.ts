import multer from "multer";

// Configure storage (optional, for now use memory storage)
const storage = multer.memoryStorage();

export const upload = multer({ storage });

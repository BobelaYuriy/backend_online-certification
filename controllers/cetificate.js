const cloudinary = require("../utils/cloudinary");

const certificate = async (req, res) => {
  try {
    const { imageFile } = req.body;
    if (!imageFile) {
      return res.status(400).json("Картинка не надіслана");
    }
    const uploadRes = await cloudinary.uploader.upload(imageFile,{
      folder: "imagesCertificates",
    });
    res.status(201).json(uploadRes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  certificate,
};

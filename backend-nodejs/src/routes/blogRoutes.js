const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const {
  getPosts,
  getPostBySlug,
  likePost,
  createPost,
  updatePost,
  deletePost
} = require("../controllers/blogController");

router.get("/posts", getPosts);
router.get("/posts/:slug", getPostBySlug);
router.post("/posts/:id/like", likePost);
router.post("/posts", upload.fields([{ name: "imagem", maxCount: 1 }]), createPost);
router.put("/posts/:slug", upload.fields([{ name: "imagem", maxCount: 1 }]), updatePost);
router.delete("/posts/:id", deletePost);

module.exports = router;
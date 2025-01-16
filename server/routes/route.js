const express = require("express");
const { useregister, userLogin, getAllUsers } = require("../controllers/userController");
const {
  userConversation,
  getUserConversation,
} = require("../controllers/conversationController");

const {
  userMessage,
  getUserMessage,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).send("welcome");
});

router.post("/user/register", useregister);
router.post("/user/login", userLogin);
router.get("/users/:userId", getAllUsers)

router.post("/user/conversation", userConversation);
router.get("/user/conversation/:userId", getUserConversation);

router.post("/user/message", userMessage);
router.get("/user/message/:conversationId", getUserMessage);
module.exports = router;

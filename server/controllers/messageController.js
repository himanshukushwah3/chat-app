const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/user");

const userMessage = async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId } = req.body;

    if (!senderId || !message) {
      return res
        .status(400)
        .json({ message: "Sender ID and message are required" });
    }

    if (conversationId === "new" && receiverId) {
      const newConversation = new Conversation({
        members: [senderId, receiverId],
      });
      await newConversation.save();
      const newMessage = new Message({
        conversationId: newConversation._id,
        senderId,
        message,
      });
      await newMessage.save();
      return res.status(200).json("Message Sent Successfully");
    } else if (!conversationId && !receiverId) {
      res.status(400).json({ msg: "Please Filled All the field" });
    }
    const newMessage = new Message({ conversationId, senderId, message });
    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserMessage = async (req, res) => {
  try {
    const checkMessage = async (conversationId) => {
      const messages = await Message.find({ conversationId });
      const userMessageData = await Promise.all(
        messages.map(async (message) => {
          const user = await User.findById(message.senderId);
          return {
            user: { id: user._id, email: user.email, name: user.name },
            message: message.message,
          };
        })
      );
      res.status(200).json(userMessageData);
    };
    const conversationId = req.params.conversationId;

    if (conversationId === "new") {
      const checkConversation = await Conversation.find({
        members: { $all: [req.query.senderId, req.query.receiverId] },
      });
      if (checkConversation.length > 0) {
        checkMessage(checkConversation[0]._id);
      } else {
        return res.status(200).json([]);
      }
    } else {
      checkMessage(conversationId);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { userMessage, getUserMessage };

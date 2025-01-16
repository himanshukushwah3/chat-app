const express = require("express");
const Conversation = require("../models/Conversation");
const User = require("../models/user");

const userConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const conversation = new Conversation({
      members: [senderId, receiverId],
    });
    await conversation.save();
    res.status(200).json({ msg: "Conversation saved successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getUserConversation = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversation = await Conversation.find({
      members: { $in: [userId] },
    });

    const userConversationData = await Promise.all(
      conversation.map(async (convo) => {
        const receiverId = convo.members.find((member) => member !== userId);
        const user = await User.findById(receiverId);
        return {
          user: { receiverId: user._id, email: user.email, name: user.name },
          conversationId: convo._id,
        };
      })
    );

    res.status(200).json(userConversationData);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
module.exports = { userConversation, getUserConversation };

const mongoose = require("mongoose");

const Connection = async () => {
  const URL = `mongodb+srv://anshv6884115:S86XTQYJe4rQeO5t@cluster0.e64um.mongodb.net/chat-app`;
  try {
    await mongoose.connect(URL);
    console.log("Database connection established...");
  } catch (error) {
    console.log("Error While Connecting to Database", error);
  }
};

module.exports = Connection;

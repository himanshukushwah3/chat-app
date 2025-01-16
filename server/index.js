const express = require("express");
const cors = require("cors");
const router = require("./routes/route");
const User = require("./models/user");
const Connection = require("./database/db");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 8000;

const io = new Server(8080, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket Connections
let users = [];
io.on("connection", (socket) => {
  // console.log("User Connected", socket.id);

  // For receiving data from backend/server
  socket.on("addUser", (userId) => {
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }
  });

  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, message, conversationId }) => {
      const receiver = users.find((user) => user.userId === receiverId);
      const sender = users.find((user) => user.userId === senderId);
      const user = await User.findById(senderId);
      if (receiver) {
        io.to(receiver.socketId)
          .to(sender.socketId)
          .emit("getMessage", {
            senderId,
            receiverId,
            message,
            conversationId,
            user: { id: user._id, name: user.name, email: user.email },
          });
      } else {
        io.to(sender.socketId).emit("getMessage", {
          senderId,
          receiverId,
          message,
          conversationId,
          user: { id: user._id, name: user.name, email: user.email },
        });
      }
    }
  );

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });

  // for sending data fron backend/server to frontend
  // io.emit("getUser", socket.userId);
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

Connection();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 14:06

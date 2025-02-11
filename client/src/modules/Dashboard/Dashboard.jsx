import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import Avatar from "../../assets/user.svg";
import Phone from "../../assets/phone.svg";
import Send from "../../assets/send.svg";
import Plus from "../../assets/circle-plus.svg";

import Input from "../../Components/Input/Input";

const Dashboard = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user:detail"))
  );
  const [conversation, setConversation] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const messageRef = useRef(null);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.messages]);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    socket?.emit("addUser", user?.id);
    socket?.on("getUsers", (users) => {
      console.log("Active Users: ", users);
    });
    socket?.on("getMessage", (data) => {
      setMessages((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { user: data.user, message: data.message },
        ],
      }));
    });
  }, [user, socket]);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user:detail"));
    const fetchConversation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/user/conversation/${loggedInUser?.id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setConversation(response.data);
      } catch (error) {
        console.error(
          "An error occurred:",
          error.response?.data || error.message
        );
      }
    };
    fetchConversation();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error(
          "An error occurred:",
          error.response?.data || error.message
        );
      }
    };
    fetchUsers();
  }, [user.id]);

  const fetchMessages = async (conversationId, receiver) => {
    try {
      const params = {};
      if (conversationId === "new") {
        params.senderId = user?.id;
        params.receiverId = messages?.receiver?.receiverId;
      }
      const response = await axios.get(
        `http://localhost:8000/user/message/${conversationId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            senderId: user?.id,
            receiverId: receiver?.receiverId,
          },
        }
      );
      setMessages({ messages: response.data, receiver, conversationId });
    } catch (error) {
      console.error(
        "An error occurred:",
        error.response?.data || error.message
      );
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8000/user/message/`,
        {
          conversationId: messages?.conversationId,
          senderId: user?.id,
          message,
          receiverId: messages?.receiver?.receiverId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // After storing message, emit to socket
      socket.emit("sendMessage", {
        senderId: user.id,
        receiverId: messages?.receiver?.receiverId,
        message,
        conversationId: messages?.conversationId,
      });

      setMessage(""); // Clear the input after sending

      
    } catch (error) {
      console.error(
        "An error occurred:",
        error.response?.data || error.message
      );
    }
    setMessage("");
  };

  return (
    <div className="w-screen flex">
      <div className="w-[25%] h-screen bg-secondary overflow-scroll">
        <div className="flex justify-center items-center my-8">
          <div className="border border-primary p-[2px] rounded-full">
            <img src={Avatar} alt="" width={60} height={60} />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl">{user?.name}</h3>
            <p className="text-lg font-light">{user?.email}</p>
          </div>
        </div>

        <hr />

        <div className="mx-5 mt-5">
          <div className="text-primary text-xl">Messages</div>
          <div>
            {conversation.length > 0 ? (
              conversation.map(({ conversationId, user, index }) => (
                <div className="flex items-center py-4 border-b border-b-gray-300">
                  <div
                    key={index}
                    className="flex cursor-pointer items-center"
                    onClick={() => fetchMessages(conversationId, user)}
                  >
                    <div className="p-[2px] rounded-full">
                      <img src={Avatar} alt="" width={40} height={40} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg">{user?.name}</h3>
                      <p className="text-sm font-light font-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Conversation
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[50%] h-screen bg-white flex flex-col items-center">
        {messages?.receiver?.email && (
          <div className="w-[75%] bg-secondary h-[80px] my-7 rounded-full flex items-center px-7 ">
            <div className="cursor-pointer">
              <img src={Avatar} alt="" width={60} height={60} />
            </div>
            <div className="ml-6 mr-auto">
              <h3 className="text-lg">{messages?.receiver?.name}</h3>
              <p className="text-sm font-light text-gray-600">
                {messages?.receiver?.email}
              </p>
            </div>

            <div className="cursor-pointer">
              <img src={Phone} alt="" width={25} height={25} />
            </div>
          </div>
        )}

        <div className="h-[95%] w-full overflow-y-auto">
          <div className="h-[1000px] px-10 py-14">
            {messages?.messages?.length > 0 ? (
              messages.messages.map(({ message, index, user: { id } = {} }) => {
                if (id === user?.id) {
                  return (
                    <>
                      <div
                        key={index}
                        className="max-w-[50%] bg-primary rounded-b-xl rounded-tr-xl ml-auto p-4 text-white mb-5"
                      >
                        {message}
                      </div>
                      <div ref={messageRef}></div>
                    </>
                  );
                } else {
                  return (
                    <div
                      key={index}
                      className="max-w-[50%] bg-secondary rounded-b-xl rounded-tr-xl p-4 mb-5"
                    >
                      {message}
                    </div>
                  );
                }
              })
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Message
              </div>
            )}
          </div>
        </div>

        {messages?.receiver?.email && (
          <div className="py-7 pl-14 w-full flex items-center">
            <Input
              placeholder="type msg here..."
              value={message}
              className="w-[75%]"
              inputClassName="p-4 border-0 shadow-md rounded-full bg-light outline-none"
              onChange={(event) => setMessage(event.target.value)}
            />
            <div
              className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${
                !message && "pointer-events-none"
              }`}
              onClick={(event) => sendMessage(event)}
            >
              <img src={Send} alt="" width={30} height={30} />
            </div>
            <div
              className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${
                !message && "pointer-events-none"
              }`}
            >
              <img src={Plus} alt="" width={30} height={30} />
            </div>
          </div>
        )}
      </div>

      <div className="w-[25%] h-screen bg-light px-8 py- overflow-scroll">
        <div className="text-primary text-lg">People</div>
        <div>
          {users?.length > 0 ? (
            users?.map(({ userId, user, index }) => (
              <div className="flex items-center py-4 border-b border-b-gray-300">
                <div
                  key={index}
                  className="flex cursor-pointer items-center"
                  onClick={() => fetchMessages("new", user)}
                >
                  <div className="p-[2px] rounded-full">
                    <img src={Avatar} alt="" width={40} height={40} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg">{user?.name}</h3>
                    <p className="text-sm font-light font-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-lg font-semibold mt-24">
              No Conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

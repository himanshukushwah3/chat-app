const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const useregister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOne({ email });
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    } else {
      if (user) {
        res.status(400).json({ msg: "user already exists" });
      } else {
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        return res.status(200).json({ msg: "Successfully signed up" });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!email || !password) {
      return res.status(400).json({ msg: "Please Fill the Field..." });
    } else {
      if (!user) {
        return res.status(400).json({ msg: "Email Does Not Match" });
      } else {
        let match = await bcrypt.compare(password, user.password);
        if (!match) {
          res.status(400).json({ error: "Password Does not Match..." });
          // res.status(400).send("Password Does not Match...");
        } else {
          const payload = {
            userId: user._id,
            email: user.email,
          };
          const JWT_SECRET_KEY =
            process.env.JWT_SECRET_KEY || "THIS_IS_JWT_SECRET_KEY";

          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 84600 },
            async (error, token) => {
              await User.updateOne({ _id: user._id }, { $set: { token } });
            }
          );
          res.status(200).json({
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
            },
            token: user.token,
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await User.find({ _id: { $ne: userId } });
    const usersData = await Promise.all(
      users.map((user) => {
        return {
          user: { email: user.email, name: user.name, receiverId: user._id },
        };
      })
    );
    res.status(200).json(usersData);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { useregister, userLogin, getAllUsers };

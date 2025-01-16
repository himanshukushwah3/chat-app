import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Input from "../../Components/Input/Input";
import Button from "../../Components/Button/Button";

const Form = ({ isSignIn = false }) => {
  const [data, setData] = useState({
    ...(!isSignIn && { name: "" }),
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // const handleSubmit = async () => {
  //   console.log(data);
  //   const response = await fetch(
  //     `http://localhost:8000/user/${isSignIn ? "login" : "register"}`,
  //     {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(data),
  //     }
  //   );
  //   const resData = await response.json();
  //   console.log(resData);
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8000/user/${isSignIn ? "login" : "register"}`,
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 400) {
        alert("Invalid Credentials");
      } else {
        if (response.data.token) {
          localStorage.setItem("user:token", response.data.token);
          localStorage.setItem("user:detail", JSON.stringify(response.data.user));
          navigate("/");
        }
      }
    } catch (error) {
      console.error(
        "An error occurred:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="bg-white w-[600px] h-[700px] shadow-lg rounded-lg flex flex-col justify-center items-center">
      <div className="text-4xl font-extrabold ">
        Welcome {isSignIn && "Back"}
      </div>
      <div className="text-xl mb-12">
        {isSignIn ? "Sign in Now" : "Sign up now"}
      </div>
      <form
        className="w-full flex flex-col justify-center items-center"
        onSubmit={(event) => handleSubmit(event)}
      >
        {!isSignIn && (
          <Input
            inputClassName="mb-6"
            className="w-1/2"
            label="Name"
            name="name"
            placeholder="Enter your Name..."
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        )}
        <Input
          inputClassName="mb-6"
          className="w-1/2"
          label="Email Address"
          name="email"
          placeholder="Enter your Email Address..."
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        <Input
          inputClassName="mb-6"
          className="w-1/2"
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your Password..."
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        <Button
          className="w-1/2 mb-2"
          type="submit"
          label={isSignIn ? "Sign In" : "Sign Up"}
        />
      </form>
      <div>
        {isSignIn ? "Did'nt have an Account?" : "Already have an Account?"}
        <span
          className="text-primary cursor-pointer underline"
          onClick={() =>
            navigate(isSignIn ? "/users/sign_up" : "/users/sign_in")
          }
        >
          {isSignIn ? "Sign Up" : "Sign in"}
        </span>
      </div>
    </div>
  );
};

export default Form;

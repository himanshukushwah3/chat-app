import React from "react";

const Button = ({ label, className = "", disabled = false, type }) => {
  return (
    <button
      type={type}
      className={`text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none foucs:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${className}`}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;

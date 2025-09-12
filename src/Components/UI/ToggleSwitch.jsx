import React from "react";

const ToggleSwitch = ({ label, variable, setVariable, onToggle , name }) => {
  return (
    <div className="mb-4 flex items-center space-x-3">
      {/* Label with Dynamic Background */}
      <label
        htmlFor={name}
        className={`text-gray-700 font-medium px-3 py-1 rounded-lg transition-all`}
      >
        {label}
      </label>

      {/* Toggle Switch */}
      <div
        className={`relative w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all
      ${!variable ? "bg-blue-600" : "bg-gray-300"}`}
        onClick={(e) => {
          setVariable(!variable);
          if (onToggle) onToggle(e);
        }}
      >
        {/* Toggle Indicator */}
        <div
          className={`h-6 w-6 bg-white rounded-full shadow-md transform transition-all
        ${!variable ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
    </div>
  );
};

export default ToggleSwitch;

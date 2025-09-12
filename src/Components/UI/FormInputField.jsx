import React from "react";

const FormInputField = ({
  name,
  label,
  inputType,
  value,
  onChange,
  disabled,
  className,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block font-semibold mb-2 text-gray-700">{label}</label>
      <input
        disabled={disabled}
        name={name}
        type={inputType}
        value={value}
        onChange={onChange}
        className="w-full disabled:cursor-not-allowed p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default FormInputField;

import React from "react";

const FormSelectField = ({
  name,
  label,
  value,
  onchange,
  options,
  className,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block font-semibold mb-2 text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onchange}
        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 `}
      >
        <option value="">-- Select --</option>
        {options
          ?.filter((option) => option && option.value)
          .map((option) => (
            <option key={option.name} value={option.value}>
              {option.name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default FormSelectField;

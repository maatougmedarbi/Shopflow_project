import React from "react";

export default function PasswordStrengthMeter({ password }) {
  // Check conditions
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\\[\]{};':"\\\\|,.<>/?]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasUpper) score += 1;
  if (hasDigit) score += 1;
  if (hasSpecial) score += 1;

  // Determine colors and label based on score
  let strengthLabel = "";
  let barColorClass = "bg-gray-200";
  
  if (password.length === 0) {
    strengthLabel = "";
    barColorClass = "bg-gray-200";
  } else if (score <= 1) {
    strengthLabel = "Weak";
    barColorClass = "bg-red-500";
  } else if (score === 2) {
    strengthLabel = "Fair";
    barColorClass = "bg-orange-500";
  } else if (score === 3) {
    strengthLabel = "Good";
    barColorClass = "bg-blue-500";
  } else if (score === 4) {
    strengthLabel = "Strong";
    barColorClass = "bg-green-500";
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level} 
            className={`flex-1 rounded-full transition-colors duration-300 ${password.length > 0 && score >= level ? barColorClass : "bg-gray-200"}`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className={`font-medium ${
          score <= 1 && password.length > 0 ? "text-red-600" :
          score === 2 ? "text-orange-600" :
          score === 3 ? "text-blue-600" :
          score === 4 ? "text-green-600" : "text-gray-500"
        }`}>
          {password.length > 0 ? strengthLabel : "Enter a password"}
        </span>
      </div>
      
      {/* Policy list */}
      <ul className="text-xs text-gray-500 space-y-1 mt-2">
        <li className="flex items-center gap-1.5">
          <span className={hasMinLength ? "text-green-500" : ""}>{hasMinLength ? "✓" : "○"}</span>
          <span className={hasMinLength ? "text-gray-800" : ""}>At least 8 characters</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className={hasUpper ? "text-green-500" : ""}>{hasUpper ? "✓" : "○"}</span>
          <span className={hasUpper ? "text-gray-800" : ""}>One uppercase letter</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className={hasDigit ? "text-green-500" : ""}>{hasDigit ? "✓" : "○"}</span>
          <span className={hasDigit ? "text-gray-800" : ""}>One digit</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className={hasSpecial ? "text-green-500" : ""}>{hasSpecial ? "✓" : "○"}</span>
          <span className={hasSpecial ? "text-gray-800" : ""}>One special character</span>
        </li>
      </ul>
    </div>
  );
}

export default function Input({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-600">
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all
          bg-white/40 backdrop-blur-md border border-white/20
          focus:ring-2 focus:ring-blue-200
          ${error ? "border-red-400" : ""}`}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
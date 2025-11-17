interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}: InputProps) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#d1d5db",
          marginBottom: "0.5rem",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          backgroundColor: "rgba(23, 23, 23, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          color: "white",
          fontSize: "0.9375rem",
          outline: "none",
          transition: "all 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#10b981";
          e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

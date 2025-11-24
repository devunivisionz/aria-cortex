// components/ui/select.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { ChevronDown } from "lucide-react";

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value = "",
  onValueChange = () => {},
  children,
}) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// SelectTrigger Component
interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = "",
}) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within a Select");

  const { open, setOpen } = context;

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`
        flex items-center justify-between w-full px-3 py-2 
        text-sm bg-white border border-gray-300 rounded-md 
        shadow-sm hover:bg-gray-50 focus:outline-none 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${className}
      `}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      {children}
      <ChevronDown
        className={`ml-2 h-4 w-4 transition-transform duration-200 ${
          open ? "transform rotate-180" : ""
        }`}
      />
    </button>
  );
};

// SelectContent Component
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className = "",
}) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within a Select");

  const { open } = context;

  if (!open) return null;

  return (
    <div
      className={`
        absolute z-50 w-full mt-1 bg-white border border-gray-300 
        rounded-md shadow-lg max-h-60 overflow-auto
        ${className}
      `}
      role="listbox"
    >
      {children}
    </div>
  );
};

// SelectItem Component
interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  className = "",
  disabled = false,
}) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within a Select");

  const { value: selectedValue, onValueChange, setOpen } = context;
  const isSelected = selectedValue === value;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value);
      setOpen(false);
    }
  };

  return (
    <div
      className={`
        px-3 py-2 text-sm cursor-pointer
        ${isSelected ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-900"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
        ${className}
      `}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

// SelectValue Component
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = "Select an option",
  className = "",
}) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within a Select");

  const { value } = context;

  return (
    <span
      className={`block truncate ${
        !value ? "text-gray-400" : "text-gray-900"
      } ${className}`}
    >
      {value || placeholder}
    </span>
  );
};

// Optional: SelectSeparator Component
export const SelectSeparator: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return <hr className={`my-1 border-gray-200 ${className}`} />;
};

// Optional: SelectGroup Component for grouping items
interface SelectGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({
  children,
  label,
  className = "",
}) => {
  return (
    <div className={className}>
      {label && (
        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

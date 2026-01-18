"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type UserDropdownProps = {
  userName: string;
  userRole: string;
  userInitials?: string;
};

export default function UserDropdown({
  userName,
  userRole,
  userInitials,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Generate initials from userName if not provided
  const getInitials = () => {
    if (userInitials) return userInitials;
    const names = userName.split(" ");
    return names
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    // Clear any session storage or local storage if needed
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    
    setIsOpen(false);
    // Redirect to home or login page
    router.push("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-semibold text-white">
          {getInitials()}
        </div>
        <span className="font-semibold text-sm hidden sm:inline max-w-[120px] truncate text-white">
          {userName}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {userRole}
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

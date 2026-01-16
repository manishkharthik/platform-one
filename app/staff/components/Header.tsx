import { Bell, Search, ChevronDown, Menu } from "lucide-react";

type HeaderProps = {
  monthName: string;
  year: number;
  onMenuClick: () => void;
};

export default function Header({ monthName, year, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="text-xs text-gray-500">
              Projects / {monthName} {year}
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              Admin Dashboard Overview
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search staff portal"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">
              WA
            </span>
            Walter Admin
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
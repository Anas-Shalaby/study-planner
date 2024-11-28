import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { BookOpen, Home, LogOut, User } from "lucide-react";
import { useAuth } from "../store/auth";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  StudyPlanner
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4 flex items-center justify-between gap-2">
                {user?.college}
                <Home className="h-4 w-4 text-indigo-600" />
              </span>
              <span className="text-gray-700 mr-4">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

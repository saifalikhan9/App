import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="flex h-screen flex-col">
      <header>
        <div className="container mx-auto  flex items-center justify-between px-6 py-2">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-xl font-bold">
              Dashboard
            </Link>
            <nav>
              <ul className="flex space-x-4 font-normal text-gray-600">
                <li>
                  <Link to="/dashboard" className="hover:text-gray-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/employees"
                    className="hover:text-gray-300"
                  >
                    Employee List
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex  items-center space-x-10 ">
            <span className="">{user?.username.toUpperCase()}</span>

            <Button
              onClick={onLogout}
              variant={"outline"}
            > 
              Logout
            </Button>
          </div>
        </div>
      </header>
      <Separator className="bg-gray-500" />
      <main className="flex-1 overflow-auto bg-gray-100 p-4">
        <Outlet />
      </main>
    </div>
  );
}

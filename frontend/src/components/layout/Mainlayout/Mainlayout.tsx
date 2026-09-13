import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import RightSidebar from "../RightSidebar/RightSidebar";

import MobileNav from "../MobileNav/MobileNav";

import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />

      <div className="main-layout__body">
        <aside className="main-layout__left">
          <Sidebar />
        </aside>

        <main className="main-layout__content">
          <Outlet />
        </main>

        <aside className="main-layout__right">
          <RightSidebar />
        </aside>
      </div>
      <MobileNav />
    </div>
  );
}
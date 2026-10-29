import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminLayout = () => {
  const { language } = useLanguage();
  const isKhmer = language === 'km' || language === 'kh';

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <div className={`min-h-screen bg-[#f4f7fb] ${isKhmer ? 'font-khmer' : 'font-english'}`}>
      
      {/* NAVBAR */}
      <AdminNavbar onMenuClick={handleOpenSidebar} />

      {/* SIDEBAR */}
      <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* MAIN CONTENT */}
      <main className="min-h-screen pt-[72px] lg:ml-[270px] flex flex-col relative transition-all duration-300">
        
        {/* PAGE CONTENT */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>

        {/* FOOTER */}
        <AdminFooter />
      </main>
    </div>
  );
};

export default AdminLayout;

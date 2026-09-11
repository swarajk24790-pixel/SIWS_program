import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomTabBar';
import QuickAddModal from '../components/QuickAddModal';
import GlobalChatWidget from '../components/GlobalChatWidget';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-darkBg text-slate-100">
      {/* Persistent Left Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <TopBar />
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomTabBar />

      {/* Global Modals & Persistent Widgets */}
      <QuickAddModal />
      <GlobalChatWidget />
    </div>
  );
}

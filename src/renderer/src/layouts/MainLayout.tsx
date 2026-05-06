import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const MainLayout: React.FC = () => {
    return (
        <>
            <Sidebar />
            <Header />
            <main className="pr-64 pt-24 min-h-screen">
                <Outlet />
            </main>
        </>
    );
};

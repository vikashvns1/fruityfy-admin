import Sidebar from './Sidebar';
import { useState } from 'react';
import { MdMenu } from 'react-icons/md';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const user = JSON.parse(localStorage.getItem('user') || '{"full_name": "Admin"}');

    return (
        <div className="flex bg-[#FDFCF7] min-h-screen font-sans">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                
                {/* --- HEADER --- */}
                <header className="bg-white py-4 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm/50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        {!isSidebarOpen && (
                            <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MdMenu size={24} className="text-[#064E3B]" />
                            </button>
                        )}
                        <h2 className="text-2xl font-serif font-bold text-[#064E3B]">Overview</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-bold text-[#064E3B]">{user.full_name}</div>
                            <div className="text-[10px] text-[#D4AF37] font-bold tracking-wider uppercase">{user.role || 'ADMIN'}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-[#064E3B] text-[#FEFCE8] flex items-center justify-center font-bold text-lg border-2 border-[#D4AF37] shadow-sm">
                            {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* --- MAIN CONTENT --- */}
                <main className="p-8 fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
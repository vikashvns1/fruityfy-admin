import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    MdDashboard, MdShoppingBasket, MdShoppingCart, MdPeople, MdLogout, MdCategory,
    MdChevronLeft, MdChevronRight, MdAdminPanelSettings, MdViewCarousel, MdLocalOffer,
    MdRateReview, MdLoyalty, MdSettings, MdInventory2,
    MdCelebration, MdRecordVoiceOver, MdCampaign, MdKeyboardArrowDown, MdKeyboardArrowUp, MdLoop
} from 'react-icons/md';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState(null); // Track open submenu

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Submenu automatically open karein agar hum uske kisi page par hain
    useEffect(() => {
        navItems.forEach(item => {
            if (item.submenu) {
                const isActiveChild = item.submenu.some(sub => location.pathname.startsWith(sub.path));
                if (isActiveChild) {
                    setExpandedMenu(item.name);
                }
            }
        });
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleMenuClick = (item) => {
        if (item.submenu) {
            // Agar sidebar band hai to pehle use kholo
            if (!isOpen) {
                toggleSidebar();
            }
            // Toggle submenu
            setExpandedMenu(expandedMenu === item.name ? null : item.name);
        }
    };

    const isActive = (path) => location.pathname.startsWith(path);
    const iconSize = 22;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={iconSize} /> },
        {
            name: 'Products',
            icon: <MdShoppingBasket size={iconSize} />,
            path: '#',
            submenu: [
                { name: 'All Products', path: '/products', icon: <MdShoppingBasket size={20} /> },
                { name: 'Juice ingredients', path: '/ingredients', icon: <MdInventory2 size={20} /> }, // ⭐ NEW
                { name: 'Juice Configurator', path: '/mapping', icon: <MdSettings size={20} /> },
                { name: 'Custom Options', path: '/custom-options', icon: <MdSettings size={20} /> },
            ]
        },
        { name: 'Categories', path: '/categories', icon: <MdCategory size={iconSize} /> },
        { name: 'Orders', path: '/orders', icon: <MdShoppingCart size={iconSize} /> },
        { name: 'Exchange Requests', path: '/exchanges', icon: <MdLoop size={iconSize} /> },
        { name: 'Customers', path: '/customers', icon: <MdPeople size={iconSize} /> },

        // --- GROUPED MARKETING MENU ---
        {
            name: 'Marketing Hub',
            icon: <MdCampaign size={iconSize} />,
            path: '#', // Parent path (clickable only for toggle)
            submenu: [
                { name: 'Popups', path: '/popups', icon: <MdViewCarousel size={20} /> },
                { name: 'Occasions', path: '/marketing/occasions', icon: <MdCelebration size={20} /> },
                { name: 'Weekly Fruit Boxes', path: '/weekly-boxes', icon: <MdInventory2 size={20} /> }, // ✅ NEW
                { name: 'Testimonials', path: '/marketing/testimonials', icon: <MdRecordVoiceOver size={20} /> },
                { name: 'Banners', path: '/banners', icon: <MdViewCarousel size={20} /> },
                { name: 'Campaigns', path: '/campaigns', icon: <MdLocalOffer size={20} /> },
                { name: 'Coupons', path: '/coupons', icon: <MdLoyalty size={20} /> },
                { name: 'Reviews', path: '/reviews', icon: <MdRateReview size={20} /> },
            ]

        },

        { name: 'Settings', path: '/settings', icon: <MdSettings size={iconSize} /> },
    ];

    if (user.role === 'admin') {
        navItems.push({ name: 'Staff', path: '/staff', icon: <MdAdminPanelSettings size={iconSize} /> });
    }

    return (
        <div className={`
            fixed left-0 top-0 h-screen bg-[#064E3B] text-white shadow-2xl z-50 
            transition-all duration-300 ease-in-out flex flex-col font-sans
            ${isOpen ? 'w-64' : 'w-20'} 
        `}>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 bg-[#D4AF37] text-[#064E3B] p-1 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-white z-50"
            >
                {isOpen ? <MdChevronLeft size={18} /> : <MdChevronRight size={18} />}
            </button>

            {/* Logo Area */}
            <div className={`p-5 border-b border-white/10 flex items-center h-20 ${isOpen ? 'justify-start' : 'justify-center'}`}>
                {isOpen ? (
                    <div className="overflow-hidden">
                        <h1 className="text-2xl font-serif font-bold text-[#FEFCE8] leading-none">Fruityfy</h1>
                        <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] mt-1">Admin Panel</p>
                    </div>
                ) : (
                    <div className="text-xl font-bold text-[#FEFCE8] border-2 border-[#D4AF37] w-8 h-8 flex items-center justify-center rounded-lg">F</div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                {navItems.map((item, index) => {
                    // Check if parent or any child is active
                    const isParentActive = item.submenu
                        ? item.submenu.some(sub => isActive(sub.path))
                        : isActive(item.path);

                    return (
                        <div key={index}>
                            {/* --- Main Item Render --- */}
                            <div
                                onClick={() => item.submenu ? handleMenuClick(item) : undefined}
                                className={`
                                    relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer
                                    ${!item.submenu ? '' : 'justify-between'}
                                    ${isParentActive && !item.submenu ? 'bg-[#FEFCE8] text-[#064E3B] font-semibold shadow-md translate-x-1' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                                    ${!isOpen && 'justify-center px-0'}
                                `}
                            >
                                {/* Actual Link or Div based on submenu */}
                                {item.submenu ? (
                                    <div className={`flex items-center gap-3 w-full ${!isOpen && 'justify-center'}`}>
                                        <span className={`transition-colors duration-200 ${isParentActive ? 'text-[#D4AF37]' : 'text-[#D4AF37] group-hover:text-[#FEFCE8]'}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
                                            {item.name}
                                        </span>
                                        {/* Dropdown Arrow */}
                                        {isOpen && (
                                            <span className="ml-auto text-gray-400">
                                                {expandedMenu === item.name ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <Link to={item.path} className={`flex items-center gap-3 w-full ${!isOpen && 'justify-center'}`}>
                                        <span className={`transition-colors duration-200 ${isParentActive ? 'text-[#064E3B]' : 'text-[#D4AF37] group-hover:text-[#FEFCE8]'}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                )}

                                {/* Tooltip for Collapsed Sidebar */}
                                {!isOpen && (
                                    <div className="absolute left-14 bg-[#064E3B] text-[#FEFCE8] text-xs px-2 py-1.5 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#D4AF37] font-medium pointer-events-none">
                                        {item.name}
                                    </div>
                                )}
                            </div>

                            {/* --- Submenu Render --- */}
                            {item.submenu && expandedMenu === item.name && isOpen && (
                                <div className="ml-4 pl-3 border-l border-white/10 space-y-1 mt-1 mb-2 animate-fadeIn">
                                    {item.submenu.map((subItem) => (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={`
                                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                ${isActive(subItem.path)
                                                    ? 'bg-white/10 text-[#FEFCE8] font-medium'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            <span className={isActive(subItem.path) ? 'text-[#D4AF37]' : 'opacity-70'}>
                                                {subItem.icon}
                                            </span>
                                            <span>{subItem.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t border-white/10 bg-[#053d2e]">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-red-500/10 text-red-200 hover:text-red-100 transition-colors ${!isOpen && 'justify-center'}`}
                >
                    <MdLogout size={20} />
                    <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
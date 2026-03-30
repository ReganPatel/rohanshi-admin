import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'

const Sidebar = ({ token, setShowSidebar }) => {
    const [pendingOrders, setPendingOrders] = useState(0);
    const [pendingReturns, setPendingReturns] = useState(0);

    const fetchCounts = async () => {
        if (!token) return;
        try {
            const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
            if (response.data.success) {
                const orders = response.data.orders;
                let newOrders = 0;
                let newReturns = 0;
                orders.forEach(order => {
                    if (order.status === 'Order Placed') newOrders++;
                    if (order.status === 'Return Requested') newReturns++;
                });
                setPendingOrders(newOrders);
                setPendingReturns(newReturns);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchCounts();
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, [token])

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    return (
        <div className='w-full sticky top-16 h-full overflow-y-auto no-scrollbar'>
            <div className='flex flex-col gap-1 sm:gap-2 pt-6 sm:pl-4 text-sm sm:text-base'>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/dashboard">
                    <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.dashboard_icon} alt="" />
                    <p className='font-medium'>Dashboard</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/add">
                    <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.add_item_icon} alt="" />
                    <p className='font-medium'>Add Items</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/list">
                    <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.list_item_icon} alt="" />
                    <p className='font-medium'>List Items</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/orders">
                    <div className='relative flex items-center justify-center'>
                        <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.orders_icon} alt="" />
                        {pendingOrders > 0 && <span className='absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-sm'>{pendingOrders > 9 ? '9+' : pendingOrders}</span>}
                    </div>
                    <p className='font-medium'>Orders</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/customers">
                    <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.customers_icon} alt="" />
                    <p className='font-medium'>Customers</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/home-settings">
                    <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.home_settings_icon} alt="" />
                    <p className='font-medium'>Home Settings</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/coupons">
                    <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.coupons_icon} alt="" />
                    <p className='font-medium'>Coupons</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/revenue">
                    <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.revenue_icon || assets.dashboard_icon} alt="" />
                    <p className='font-medium'>Revenue</p>
                </NavLink>

                <NavLink onClick={handleLinkClick} className='flex items-center gap-3 dark:text-gray-300 px-4 py-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 group' to="/returns">
                    <div className='relative flex items-center justify-center'>
                        <img className='w-5 h-5 opacity-70 group-hover:opacity-100' src={assets.returns_icon} alt="" />
                        {pendingReturns > 0 && <span className='absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-sm'>{pendingReturns > 9 ? '9+' : pendingReturns}</span>}
                    </div>
                    <p className='font-medium'>Return Products</p>
                </NavLink>

            </div>
        </div>
    )
}

export default Sidebar
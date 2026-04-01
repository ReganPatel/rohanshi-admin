import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Customers = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchUsers = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/admin/users', { headers: { token } });
            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId) => {
        try {
            const response = await axios.post(backendUrl + '/api/admin/user/status', { userId }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers(); // Refresh list to get updated status
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    return (
        <div className='flex flex-col gap-8 w-full p-4 sm:p-10 pb-20 sm:pb-32'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6'>
                <div>
                    <h1 className='text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 leading-tight tracking-tight'>Customers</h1>
                    <p className='text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1'>View all registered users</p>
                </div>
                <div className='flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto'>
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by customer name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors shadow-sm dark:text-white placeholder-gray-400 font-bold"
                        />
                    </div>
                    <div className='bg-indigo-600 dark:bg-indigo-600 px-6 py-2.5 rounded-2xl shadow-2xl shadow-indigo-600/20 w-full sm:w-fit whitespace-nowrap shrink-0 text-center sm:text-left'>
                        <p className='text-[10px] font-black text-white uppercase tracking-[0.2em]'>Total: {filteredUsers.length} Users</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 glass-effect rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl">
                    <div className="w-16 h-16 border-4 border-indigo-100/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing Customer DB...</p>
                </div>
            ) : (
                <div className='glass-effect rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden'>
                    <div className='overflow-x-auto no-scrollbar'>
                        <table className='w-full text-left hidden md:table'>
                            <thead className='bg-gray-50/50 dark:bg-slate-900/50 border-b border-white/10'>
                                <tr>
                                    <th className='px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]'>Account Holder</th>
                                    <th className='px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]'>Secured Contact</th>
                                    <th className='px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]'>Onboarding</th>
                                    <th className='px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]'>Account Status</th>
                                    <th className='px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right'>Pipeline</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-white/10 dark:divide-gray-800/50'>
                                {filteredUsers.map((user, index) => (
                                    <tr key={user._id} className='group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300'>
                                        <td className='px-8 py-6'>
                                            <div className='flex items-center gap-4'>
                                                <div className='w-12 h-12 rounded-[1.2rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 border border-white dark:border-indigo-800 group-hover:scale-110 shadow-lg transition-transform'>
                                                    {user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className='font-black text-gray-800 dark:text-white leading-none text-base'>{user.name}</p>
                                                    <p className='text-[9px] text-indigo-500 dark:text-indigo-400 font-black uppercase mt-1.5 tracking-widest opacity-80'># {user._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-8 py-6'>
                                            <div className='flex flex-col gap-1.5'>
                                                <a href={`mailto:${user.email}`} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                    {user.email}
                                                </a>
                                                {user.addresses && user.addresses.length > 0 && user.addresses[0].phone && (
                                                    <a href={`tel:${user.addresses[0].phone}`} className="text-[11px] font-black text-gray-400 dark:text-gray-500 hover:text-indigo-500 transition-colors flex items-center gap-2 px-0.5">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                        {user.addresses[0].phone}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className='px-8 py-6'>
                                            <p className='text-xs font-black text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800 w-fit tabular-nums'>
                                                {new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </td>
                                        <td className='px-8 py-6'>
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                                                user.isBlocked 
                                                    ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/50' 
                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                                {user.isBlocked ? 'Deactive' : 'Verified'}
                                            </span>
                                        </td>
                                        <td className='px-8 py-6 text-right'>
                                            <button
                                                onClick={() => toggleStatus(user._id)}
                                                className={`px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${
                                                    user.isBlocked 
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:-translate-y-0.5' 
                                                        : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white dark:bg-rose-900/10 dark:border-rose-800 hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {user.isBlocked ? 'Active' : 'Deactive'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className='flex flex-col items-center gap-3'>
                                                <div className='w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center'>
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-bold">No customers found in your database.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Optimized Cards */}
                        <div className='md:hidden flex flex-col divide-y divide-white/10'>
                            {filteredUsers.map((user) => (
                                <div key={user._id} className='p-6 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10 transition-colors'>
                                    <div className='flex items-center gap-4 mb-5'>
                                        <div className='w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 border border-white dark:border-indigo-800 shadow-lg shrink-0'>
                                            {user.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className='font-black text-gray-800 dark:text-white text-lg leading-tight truncate'>{user.name}</p>
                                            <p className='text-[9px] text-indigo-500 dark:text-indigo-400 font-black uppercase mt-1 tracking-widest'># {user._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                user.isBlocked 
                                                    ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400' 
                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20'
                                            }`}>
                                                <span className={`w-1 h-1 rounded-full ${user.isBlocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                                {user.isBlocked ? 'Deactive' : 'Active'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 gap-3 mb-6'>
                                        <div className="p-3 bg-white/30 dark:bg-gray-800/40 rounded-2xl border border-white/20 dark:border-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <p className='text-sm text-gray-600 dark:text-gray-300 font-bold truncate'>{user.email}</p>
                                            </div>
                                        </div>
                                        {user.addresses && user.addresses.length > 0 && user.addresses[0].phone && (
                                            <div className="p-3 bg-white/30 dark:bg-gray-800/40 rounded-2xl border border-white/20 dark:border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                    </div>
                                                    <p className='text-sm text-gray-600 dark:text-gray-300 font-black tracking-widest'>{user.addresses[0].phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Joined {new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                        <button
                                            onClick={() => toggleStatus(user._id)}
                                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${
                                                user.isBlocked 
                                                    ? 'bg-indigo-600 text-white shadow-indigo-600/30' 
                                                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                                            }`}
                                        >
                                            {user.isBlocked ? 'Active' : 'Deactive'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;

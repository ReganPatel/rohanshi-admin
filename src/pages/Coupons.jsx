import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const Coupons = ({ token }) => {
    const [coupons, setCoupons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minimumPurchase: '',
        expirationDate: ''
    });

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/coupon/list', { headers: { token } });
            if (response.data.success) {
                setCoupons(response.data.coupons);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                discountType: form.discountType,
                discountAmount: Number(form.discountAmount),
                minimumPurchase: Number(form.minimumPurchase) || 0,
                expirationDate: form.expirationDate || null
            };

            const response = await axios.post(backendUrl + '/api/coupon/add', payload, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                setForm({ code: '', discountType: 'percentage', discountAmount: '', minimumPurchase: '', expirationDate: '' });
                fetchCoupons();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const response = await axios.post(backendUrl + '/api/coupon/remove', { id }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCoupons();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const response = await axios.post(backendUrl + '/api/coupon/toggle', { id, isActive: !currentStatus }, { headers: { token } });
            if (response.data.success) {
                toast.success("Coupon status updated");
                fetchCoupons();
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
            fetchCoupons();
        }
    }, [token]);

    return (
        <div className='flex flex-col w-full items-start gap-10 p-4 sm:p-10 pb-24 sm:pb-40'>
            <div className="w-full">
                <h1 className='text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 leading-tight tracking-tight'>Manage Coupons</h1>
                <p className='text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1'>Create discounts for your customers</p>
            </div>

            {/* ADD COUPON FORM */}
            <div className='glass-effect p-8 sm:p-10 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl w-full max-w-3xl relative overflow-hidden'>
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl -mr-24 -mt-24"></div>
                
                <div className="mb-10">
                    <h2 className='text-xl sm:text-2xl font-black text-gray-800 dark:text-white'>Create New Coupon</h2>
                    <p className='text-[10px] sm:text-xs text-gray-400 font-black uppercase tracking-widest mt-1'>Enter coupon details</p>
                </div>

                <form onSubmit={handleAddCoupon} className='flex flex-col gap-6'>
                    <div>
                        <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Unique Code</p>
                        <input
                            type="text"
                            placeholder="e.g. SUMMER2026"
                            required
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-black tracking-[0.3em] shadow-sm'
                        />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Discount Type</p>
                            <select
                                value={form.discountType}
                                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 outline-none transition-all text-xs font-black uppercase tracking-widest appearance-none bg-no-repeat bg-[right_1.5rem_center] cursor-pointer shadow-sm'
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ({currency})</option>
                            </select>
                        </div>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Discount Amount</p>
                            <input
                                type="number"
                                placeholder={form.discountType === 'percentage' ? "e.g. 15" : "e.g. 500"}
                                required
                                min="1"
                                value={form.discountAmount}
                                onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                                className='w-full px-6 py-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-black shadow-sm'
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Minimum Purchase</p>
                            <input
                                type="number"
                                placeholder="Min Purchase"
                                min="0"
                                value={form.minimumPurchase}
                                onChange={(e) => setForm({ ...form, minimumPurchase: e.target.value })}
                                className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 outline-none transition-all text-sm font-black shadow-sm'
                            />
                        </div>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Expiration Date</p>
                            <input
                                type="date"
                                value={form.expirationDate}
                                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                                className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 outline-none transition-all text-sm font-black shadow-sm'
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/30 transform hover:-translate-y-1.5 active:scale-95 transition-all text-xs mt-6 border border-white/10 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Generating...' : 'Create Coupon'}
                    </button>
                </form>
            </div>

            {/* LIST COUPONS */}
            <div className='w-full'>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 px-2">
                    <h2 className='text-xl sm:text-2xl font-black text-gray-800 dark:text-white uppercase tracking-widest'>Active Coupons</h2>
                    <span className='px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black tracking-widest uppercase border border-indigo-100 dark:border-indigo-800 w-fit'>
                        {coupons.length} Active Coupons
                    </span>
                </div>
                
                {/* Desktop View */}
                <div className='hidden md:block glass-effect rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden'>
                    <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_1fr_0.5fr] items-center py-6 px-10 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800'>
                        <b className='text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]'>Coupon Code</b>
                        <b className='text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]'>Type</b>
                        <b className='text-[11px] font-black uppercase text-gray-400 tracking-[0.15em]'>Discount</b>
                        <b className='text-[11px] font-black uppercase text-gray-400 tracking-[0.15em]'>Min Purchase</b>
                        <b className='text-[11px] font-black uppercase text-gray-400 tracking-[0.15em]'>Expiry</b>
                        <b className='text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] text-center'>Status</b>
                        <b className='text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] text-center'>Action</b>
                    </div>

                    <div className='divide-y divide-white/10'>
                        {coupons.map((coupon, index) => (
                            <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_1fr_0.5fr] items-center gap-4 py-6 px-10 hover:bg-white/40 dark:hover:bg-gray-800/10 transition-colors' key={index}>
                                <p className='font-black text-indigo-600 dark:text-indigo-400 tracking-[0.2em] text-sm'>{coupon.code}</p>
                                <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest'>{coupon.discountType}</p>
                                <p className='font-black text-gray-800 dark:text-white tabular-nums'>
                                    {coupon.discountType === 'fixed' ? currency : ''}{coupon.discountAmount.toLocaleString()}{coupon.discountType === 'percentage' ? '%' : ''}
                                </p>
                                <p className='text-xs font-black text-gray-500 tabular-nums'>{coupon.minimumPurchase > 0 ? `${currency}${coupon.minimumPurchase.toLocaleString()}` : 'Infinite'}</p>
                                <p className='text-xs font-black text-gray-400 uppercase tracking-tighter'>
                                    {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Perpetual'}
                                </p>

                                <div className='flex justify-center'>
                                    <button
                                        onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                                        className={`px-5 py-2 text-[9px] rounded-2xl font-black uppercase tracking-widest transition-all ${coupon.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}
                                    >
                                        {coupon.isActive ? 'Active' : 'Disabled'}
                                    </button>
                                </div>

                                <div className='flex justify-center'>
                                    <button onClick={() => handleRemoveCoupon(coupon._id)} className='w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-black text-xl'>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile View */}
                <div className='md:hidden flex flex-col gap-6'>
                    {coupons.map((coupon, index) => (
                        <div key={index} className='glass-effect p-6 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-xl relative overflow-hidden'>
                            <div className='flex justify-between items-start mb-6'>
                                <div>
                                    <span className='px-4 py-1 bg-indigo-600 text-white rounded-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-indigo-600/20'>
                                        {coupon.code}
                                    </span>
                                    <h3 className='text-lg font-black text-gray-800 dark:text-white mt-3'>
                                        {coupon.discountType === 'fixed' ? currency : ''}{coupon.discountAmount.toLocaleString()}{coupon.discountType === 'percentage' ? '%' : ''} OFF
                                    </h3>
                                    <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mt-1'>{coupon.discountType} Discount</p>
                                </div>
                                <button
                                    onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                                    className={`px-4 py-2 text-[9px] rounded-xl font-black uppercase tracking-widest transition-all ${coupon.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                                >
                                    {coupon.isActive ? 'Active' : 'Disabled'}
                                </button>
                            </div>

                            <div className='grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800'>
                                <div>
                                    <p className='text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1'>Min Purchase</p>
                                    <p className='text-xs font-black text-gray-800 dark:text-white tabular-nums'>
                                        {coupon.minimumPurchase > 0 ? `${currency}${coupon.minimumPurchase.toLocaleString()}` : 'None'}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1'>Expiry</p>
                                    <p className='text-xs font-black text-gray-800 dark:text-white'>
                                        {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRemoveCoupon(coupon._id)}
                                className='absolute bottom-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center text-rose-400 active:bg-rose-50 dark:active:bg-rose-900/20 transition-all font-black text-xl'
                            >
                                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    ))}
                </div>

                {coupons.length === 0 && (
                    <div className='p-16 text-center glass-effect rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800'>
                        <div className='w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                        </div>
                        <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>No coupons found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Coupons;

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Returns = ({ token }) => {
    const [returns, setReturns] = useState([])
    const [selectedImages, setSelectedImages] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)

    const fetchReturns = async () => {
        if (!token) {
            return null;
        }

        try {
            const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
            if (response.data.success) {
                // Filter orders with return-related statuses
                const returnOrders = response.data.orders.filter(
                    order => ['Return Requested', 'Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Return Canceled'].includes(order.status)
                )
                setReturns(returnOrders.reverse())
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const statusHandler = async (event, orderId) => {
        try {
            const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
            if (response.data.success) {
                await fetchReturns()
                toast.success(response.data.message)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        fetchReturns()
    }, [token])

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setSelectedOrder(null);
            }
        };
        if (selectedOrder) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [selectedOrder]);

    return (
        <div className='flex flex-col w-full items-start gap-10 p-4 sm:p-10 pb-24 sm:pb-40'>
            <div className="w-full">
                <h1 className='text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 leading-tight tracking-tight'>Manage Returns</h1>
                <p className='text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1'>View and process customer returns</p>
            </div>

            <div className='w-full flex flex-col gap-6 sm:gap-8'>
                {returns.map((order, index) => (
                    <div className='glass-effect rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-lg sm:shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative' key={index}>
                        <div className='p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8'>

                            {/* Icon & Items Summary */}
                            <div className='flex flex-col sm:flex-row items-start gap-4 lg:w-1/3'>
                                <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800 shadow-inner'>
                                    <img className='w-6 sm:w-8' src={assets.parcel_icon} alt="" />
                                </div>
                                <div className='space-y-1.5 w-full'>
                                    <div className='flex flex-wrap gap-1'>
                                        {order.items.map((item, idx) => (
                                            <span key={idx} className='text-[12px] sm:text-[13px] font-semibold text-gray-800 dark:text-gray-200'>
                                                {item.name} <span className='text-gray-400'>x{item.quantity}</span>
                                                {idx !== order.items.length - 1 && <span className='text-gray-300 ml-1'>,</span>}
                                            </span>
                                        ))}
                                    </div>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400'>
                                        Order ID: {order._id?.toUpperCase()}
                                    </p>
                                    <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className='text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-all shadow-md active:scale-95'
                                        >
                                            View Details
                                        </button>
                                        <div className='flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium'>
                                            <span className='flex items-center gap-1'>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(order.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Address */}
                            <div className='w-full lg:w-1/4 space-y-3 sm:space-y-4 pt-4 sm:pt-0 border-t border-gray-100 sm:border-t-0 dark:border-white/5'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center text-[10px] sm:text-xs font-black text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 uppercase shadow-sm'>
                                        {(order.address?.firstName?.[0] || '') + (order.address?.lastName?.[0] || '') || (order.address?.firstname?.[0] || '') + (order.address?.lastname?.[0] || '') || '?'}
                                    </div>
                                    <p className='font-bold text-gray-800 dark:text-white'>
                                        {order.address?.firstName ? (order.address.firstName + " " + (order.address.lastName || "")) : (order.address?.firstname ? (order.address.firstname + " " + (order.address.lastname || "")) : "Customer")}
                                    </p>
                                </div>
                                <div className='text-[11px] text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800'>
                                    <p className='font-bold text-[9px] uppercase text-gray-400 mb-1'>Delivery Address</p>
                                    <p className="line-clamp-2">{order.address.street}, {order.address.city}, {order.address.state}</p>
                                    <p className='font-bold text-gray-600 dark:text-gray-300 mt-1'>{order.address.phone}</p>
                                </div>
                            </div>

                            {/* Return Rationale */}
                            <div className='w-full lg:w-1/4 flex flex-col gap-3'>
                                <div className='bg-rose-50/50 dark:bg-rose-900/10 p-4 sm:p-5 rounded-2xl border border-rose-100/50 dark:border-rose-900/20 shadow-sm'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse'></div>
                                        <h4 className='font-black text-[9px] uppercase tracking-widest text-rose-600 dark:text-rose-400'>Reason for Return</h4>
                                    </div>
                                    <p className='text-[10px] font-bold text-gray-600 dark:text-gray-400 italic line-clamp-3'>"{order.returnReason || 'Reason not provided.'}"</p>
                                    {order.returnImages && order.returnImages.length > 0 && (
                                        <div className='flex gap-1.5 mt-2 overflow-x-auto no-scrollbar'>
                                            {order.returnImages.slice(0, 3).map((img, i) => (
                                                <img 
                                                    key={i} 
                                                    src={img} 
                                                    onClick={() => setSelectedImages(order.returnImages)}
                                                    className='w-8 h-8 object-cover rounded-lg border border-white/20 cursor-pointer hover:scale-105 transition-transform' 
                                                />
                                            ))}
                                            {order.returnImages.length > 3 && (
                                                <div onClick={() => setSelectedImages(order.returnImages)} className="w-8 h-8 rounded-lg bg-white/50 dark:bg-gray-800/80 border border-dashed border-gray-300 flex items-center justify-center text-[8px] font-black text-gray-400 cursor-pointer">
                                                    +{order.returnImages.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status & Action */}
                            <div className='w-full lg:w-1/6 lg:ml-auto flex flex-col sm:flex-row lg:flex-col gap-4 sm:items-center lg:items-stretch pt-4 sm:pt-0 border-t border-gray-100 sm:border-t-0 dark:border-white/5'>
                                <div className="mb-1 sm:mb-0 lg:mb-1 w-full sm:w-auto lg:w-full flex justify-between sm:block items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-1">Total Amount</p>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{currency}{order.amount}</p>
                                </div>
                                <div className="w-full sm:w-auto lg:w-full flex flex-col gap-1 sm:gap-2 justify-end sm:justify-center lg:justify-start">
                                    <p className='text-[10px] font-black uppercase text-gray-400 tracking-widest hidden lg:block'>Update Status</p>
                                    <select
                                        onChange={(event) => statusHandler(event, order._id)}
                                    value={order.status}
                                    className={`p-3 text-[10px] font-black rounded-xl border appearance-none cursor-pointer transition-all outline-none text-center shadow-sm ${order.status === 'Returned' || order.status === 'Refund Credited'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                        : (order.status === 'Return Canceled'
                                            ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                                            : 'bg-white dark:bg-gray-800 text-orange-500 dark:text-orange-400 border-gray-200 dark:border-gray-700 hover:border-orange-500')
                                        }`}
                                >
                                    <option value="Return Requested">Pending Review</option>
                                    <option value="Initiated">Approve & Initiate</option>
                                    <option value="Return Canceled">Reject Return</option>
                                    {['Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Refund Credited'].includes(order.status) && (
                                        <>
                                            <option value="Dropped off">Dropped Off</option>
                                            <option value="Received">Received</option>
                                            <option value="Refund Issued">Issue Refund</option>
                                            <option value="Refund Credited">Refunded</option>
                                        </>
                                    )}
                                </select>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}

                {returns.length === 0 && (
                    <div className='w-full glass-effect rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 p-16 sm:p-20 text-center'>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <p className='text-xs font-black uppercase text-gray-400 tracking-[0.2em]'>No returns found</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal - Ported from Orders.jsx and refined for smaller viewports */}
            {selectedOrder && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300'>
                    <div className='bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 flex flex-col animate-in zoom-in-95 duration-300'>
                        {/* Modal Header */}
                        <div className='p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50'>
                            <div>
                                <h2 className='text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight'>Return Details</h2>
                                <p className='text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1'>ID: {selectedOrder._id.toUpperCase()}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className='w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30 transition-all shadow-sm'
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className='p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1'>
                            <div className='space-y-4 sm:space-y-6'>
                                {/* Return Rationale in Modal */}
                                <div className='p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20'>
                                    <p className='text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-2'>Return Reason</p>
                                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300 italic'>"{selectedOrder.returnReason || 'No reason provided.'}"</p>
                                    
                                    {selectedOrder.returnImages && selectedOrder.returnImages.length > 0 && (
                                        <div className="mt-4">
                                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>Attached Photos</p>
                                            <div className='flex flex-wrap gap-2'>
                                                {selectedOrder.returnImages.map((img, i) => (
                                                    <img key={i} src={img} className='w-20 h-20 object-cover rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105 cursor-pointer' onClick={() => setSelectedImages(selectedOrder.returnImages)} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='h-px bg-gray-100 dark:bg-gray-800 my-2'></div>

                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 group hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all'>
                                        <div className='flex gap-4 items-center w-full sm:w-auto'>
                                            <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm'>
                                                <img className='w-full h-full object-cover' src={item.image?.[0] || assets.parcel_icon} alt={item.name} />
                                            </div>
                                            <div className='flex-1 min-w-0 sm:hidden'>
                                                <h4 className='font-bold text-gray-800 dark:text-white truncate text-sm'>{item.name}</h4>
                                                <div className='flex flex-wrap gap-x-3 gap-y-1 mt-1'>
                                                    <span className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Qty: <span className='text-indigo-600 dark:text-indigo-400'>{item.quantity}</span></span>
                                                    {item.size && <span className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Size: <span className='text-indigo-600 dark:text-indigo-400'>{item.size}</span></span>}
                                                </div>
                                                <p className='text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1'>{currency}{item.price}</p>
                                            </div>
                                        </div>
                                        <div className='hidden sm:block flex-1 min-w-0'>
                                            <h4 className='font-bold text-gray-800 dark:text-white truncate'>{item.name}</h4>
                                            <div className='flex flex-wrap gap-x-4 gap-y-1 mt-1'>
                                                <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Qty: <span className='text-indigo-600 dark:text-indigo-400'>{item.quantity}</span></span>
                                                {item.size && <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Size: <span className='text-indigo-600 dark:text-indigo-400'>{item.size}</span></span>}
                                            </div>
                                            <p className='text-sm font-black text-indigo-600 dark:text-indigo-400 mt-2'>{currency}{item.price}</p>
                                        </div>
                                        <div className='w-full sm:w-auto flex justify-between sm:block text-right pt-3 sm:pt-0 border-t border-gray-200 sm:border-t-0 dark:border-gray-700'>
                                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>Subtotal</p>
                                            <p className='font-black text-gray-800 dark:text-white'>{currency}{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary in Modal */}
                            <div className='mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20'>
                                    <p className='text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1'>Customer Phone</p>
                                    <p className='text-[11px] font-bold text-gray-600 dark:text-gray-400'>{selectedOrder.address.phone}</p>
                                </div>
                                <div className='p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-right flex flex-col justify-center'>
                                    <p className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1'>Refundable Amount</p>
                                    <p className='text-2xl font-black text-emerald-600 dark:text-emerald-400'>{currency}{selectedOrder.amount}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className='p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end'>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className='px-8 py-3 bg-gray-800 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all'
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal Viewer */}
            {selectedImages && (
                <div className='fixed inset-0 bg-gray-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300' onClick={() => setSelectedImages(null)}>
                    <div className='relative max-w-5xl w-full glass-effect rounded-[2.5rem] border border-white/10 p-4 shadow-3xl' onClick={e => e.stopPropagation()}>
                        <button
                            className='absolute -top-12 right-0 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-indigo-400 transition-colors'
                            onClick={() => setSelectedImages(null)}
                        >
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">&times;</span> Close Gallery
                        </button>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto p-4 custom-scrollbar rounded-[2rem]'>
                            {selectedImages.map((img, i) => (
                                <img key={i} src={img} alt="" className='w-full rounded-[1.5rem] border border-white/5' />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Returns

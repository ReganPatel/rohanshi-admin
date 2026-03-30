import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {
  const statusOrder = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Refund Credited', 'Return Canceled'];

  const [orders, setOrders] = useState([])
  const [displayOrders, setDisplayOrders] = useState([])
  const [sortType, setSortType] = useState('latest')
  const [statusFilter, setStatusFilter] = useState('All')
  const [orderType, setOrderType] = useState('delivery') // 'delivery', 'returns', 'all'
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchId, setSearchId] = useState('')

  const fetchAllOrders = async () => {
    if (!token) return null;
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        // Reverse for initial latest first
        setOrders(response.data.orders);
        setDisplayOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
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
    let filtered = [...orders];
    // Order Type Filter (Delivery, Returns, All)
    if (orderType === 'delivery') {
      filtered = filtered.filter(order => !['Cancelled', 'Return Requested', 'Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Refund Credited', 'Return Canceled'].includes(order.status));
    } else if (orderType === 'returns') {
      filtered = filtered.filter(order => order.status !== 'Cancelled' && ['Return Requested', 'Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Refund Credited', 'Return Canceled'].includes(order.status));
    }

    // Secondary Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Returns') {
        filtered = filtered.filter(order => ['Return Requested', 'Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Refund Credited'].includes(order.status));
      } else {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
    }

    // Sort by Date
    if (sortType === 'latest') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Search by Order ID
    if (searchId.trim()) {
      filtered = filtered.filter(order => order._id.toLowerCase().includes(searchId.toLowerCase().trim()));
    }

    setDisplayOrders(filtered);
  }, [orders, sortType, statusFilter, orderType, searchId])

  useEffect(() => {
    fetchAllOrders();
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
    <div className='flex flex-col gap-8 w-full p-4 sm:p-8 pb-20 sm:pb-32'>
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
        <div className='flex flex-col gap-6 w-full lg:w-auto'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 leading-tight tracking-tight'>Sales Orders</h1>
            <p className='text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1'>Manage customer orders</p>
          </div>

          <div className='flex items-center bg-gray-50/50 dark:bg-gray-800/50 p-1.5 rounded-2xl w-full sm:w-fit border border-gray-100 dark:border-gray-700/50 glass-effect overflow-x-auto no-scrollbar'>
            <div className='flex items-center min-w-max'>
              <button onClick={() => { setOrderType('delivery'); setStatusFilter('All'); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderType === 'delivery' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>Delivery</button>
              <button onClick={() => { setOrderType('returns'); setStatusFilter('All'); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderType === 'returns' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>Returns</button>
              <button onClick={() => { setOrderType('all'); setStatusFilter('All'); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderType === 'all' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>Summary</button>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3 w-full lg:w-auto'>
          {/* Enhanced Search & Filters */}
          <div className='flex-1 lg:w-72 relative group'>
            <input 
              type="text" 
              placeholder="Track #ID..." 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className='w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white'
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='flex-1 sm:flex-auto px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 outline-none dark:text-white cursor-pointer transition-all'
            >
              <option value="All">All Flow</option>
              {/* Other options... I'll keep them as they are but styled better */}
              <option value="Order Placed">Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className='flex-1 sm:flex-auto px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 outline-none dark:text-white cursor-pointer transition-all'
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {
          displayOrders.map((order, index) => (
            <div className='glass-effect rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden' key={index}>
                <div className='p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center gap-8'>

                {/* Primary Info (Items & Summary) */}
                <div className='flex flex-col sm:flex-row items-center sm:items-start gap-5 lg:w-1/3'>
                  <div className='w-20 h-20 sm:w-16 sm:h-16 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-white dark:border-indigo-800 shadow-xl overflow-hidden'>
                    <img className='w-10 sm:w-8 group-hover:scale-110 transition-transform duration-500' src={assets.parcel_icon} alt="" />
                  </div>
                  <div className='space-y-2 w-full text-center sm:text-left'>
                    <div className='flex flex-wrap justify-center sm:justify-start gap-1.5'>
                      {order.items.map((item, idx) => (
                        <span key={idx} className='text-xs font-black text-gray-800 dark:text-gray-200 flex items-center'>
                          {item.name} <span className='text-[10px] text-indigo-500 dark:text-indigo-400 ml-1'>x{item.quantity}</span>
                          {idx !== order.items.length - 1 && <span className='text-gray-300 mx-1'>•</span>}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 sm:mt-1">
                      <button onClick={() => setSelectedOrder(order)} className='inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95'>
                        Review Order
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <p className='text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2'>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                      ID: {order._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='lg:w-1/4 space-y-3 p-4 sm:p-5 bg-gray-50/50 dark:bg-gray-900/40 rounded-[2rem] border border-gray-100 dark:border-gray-800 relative group overflow-hidden'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-[11px] font-black text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-gray-700 shadow-sm uppercase'>
                      {(order.address?.firstName?.[0] || '') + (order.address?.lastName?.[0] || '') || (order.address?.firstname?.[0] || '') + (order.address?.lastname?.[0] || '') || '?'}
                    </div>
                    <div>
                      <p className='font-black text-gray-800 dark:text-white text-sm'>
                        {order.address?.firstName ? (order.address.firstName + " " + (order.address.lastName || "")) : (order.address?.firstname ? (order.address.firstname + " " + (order.address.lastname || "")) : "Customer")}
                      </p>
                      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Shipment Destination</p>
                    </div>
                  </div>
                  <div className='text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold space-y-0.5 opacity-80'>
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state} - {order.address.zipcode}</p>
                    <p className='pt-1.5 font-black text-indigo-600 dark:text-indigo-400 tabular-nums'>{order.address.phone}</p>
                  </div>
                  <svg className="w-16 h-16 absolute -bottom-4 -right-4 text-gray-100 dark:text-gray-800/40 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>

                <div className='lg:w-1/6 flex flex-col justify-center gap-3'>
                  <div className='bg-indigo-50/50 dark:bg-indigo-900/20 p-5 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-800/30 text-center'>
                    <p className='text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-500 tracking-[0.2em] mb-1'>Cash Flow</p>
                    <p className='text-2xl font-black text-indigo-600 dark:text-indigo-400'>{currency}{order.amount}</p>
                    <p className='text-[9px] font-black uppercase tracking-tighter text-gray-400 mt-1'>{order.paymentMethod} • {order.payment ? 'Settled' : 'Unpaid'}</p>
                  </div>
                </div>

                <div className='lg:w-1/6 lg:ml-auto flex flex-col gap-3'>
                  <p className='text-[10px] font-black uppercase text-gray-400 tracking-widest px-1'>Logistics Pipeline</p>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    disabled={['Returned', 'Return Canceled', 'Refund Credited'].includes(order.status)}
                    className={`px-5 py-4 text-xs font-black rounded-2xl border-2 appearance-none cursor-pointer transition-all outline-none text-center shadow-lg hover:scale-105 active:scale-95 ${['Delivered', 'Return Requested'].includes(order.status)
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800'
                        : (['Returned', 'Return Canceled', 'Refund Credited'].includes(order.status)
                          ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-800'
                          : 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-gray-100 dark:border-gray-800 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-500/10')
                      }`}
                  >
                    {/* Basic Flow Statuses (Order Placed to Delivered) */}
                    {!['Return Requested', 'Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Refund Credited', 'Return Canceled'].includes(order.status) && (
                      statusOrder.slice(0, 5).map((s, i) => {
                        const currentIndex = statusOrder.indexOf(order.status);
                        if (i < currentIndex) return null;
                        return <option key={i} value={s}>{s}</option>;
                      })
                    )}

                    {/* Return Flow Statuses (Only if return is already initiated/accepted) */}
                    {(['Initiated', 'Dropped off', 'Received', 'Refund Issued', 'Refund Credited'].includes(order.status)) && (
                      <>
                        {/* Current Status always visible */}
                        <option value={order.status}>{order.status === 'Refund Credited' ? 'Refunded' : order.status}</option>

                        {/* Career through the return lifecycle (ONLY if already accepted from Returns section) */}
                        {order.status === 'Initiated' && <option value="Dropped off">Mark as Dropped Off</option>}
                        {['Initiated', 'Dropped off'].includes(order.status) && <option value="Received">Mark as Received (Restock)</option>}
                        {['Initiated', 'Dropped off', 'Received'].includes(order.status) && <option value="Refund Issued">Issue Refund (Razorpay Auto)</option>}
                      </>
                    )}

                    {/* Return Requested status - Visible but read-only/limited in Orders. Its managed in Returns.jsx */}
                    {order.status === 'Return Requested' && (
                      <option value="Return Requested">Return Requested (Manage in Returns)</option>
                    )}

                    {/* Cancelled status */}
                    {order.status === 'Cancelled' && (
                      <option value="Cancelled">Cancelled by User</option>
                    )}

                    {/* Return Canceled - Show as Return Rejected */}
                    {order.status === 'Return Canceled' && (
                      <option value="Return Canceled">Return Rejected</option>
                    )}
                  </select>

                </div>

              </div>
            </div>
          ))
        }
      </div>

      {selectedOrder && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-0 xs:p-2 sm:p-4 md:p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-500'>
          <div className='bg-white dark:bg-gray-900 w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 dark:border-gray-800 flex flex-col animate-in slide-in-from-bottom-12 duration-500'>
            {/* Premium Modal Header */}
            <div className='p-8 sm:p-10 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30'>
              <div>
                <h2 className='text-3xl font-black text-gray-800 dark:text-white leading-none'>Order Detail</h2>
                <div className='flex items-center gap-3 mt-3'>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  <p className='text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]'>System.Log: {selectedOrder._id.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className='w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all shadow-sm'
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className='p-8 sm:p-10 pt-4 overflow-y-auto custom-scrollbar flex-1'>
              <div className='space-y-5'>
                <p className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest px-2">Manifest Breakdown</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-5 p-5 rounded-[2rem] bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 group hover:border-indigo-400 dark:hover:border-indigo-900 transition-all duration-300'>
                    <div className='w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-700 shrink-0 shadow-xl group-hover:scale-105 transition-transform'>
                      <img className='w-full h-full object-cover' src={item.image?.[0] || assets.parcel_icon} alt={item.name} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-lg font-black text-gray-800 dark:text-white truncate'>{item.name}</h4>
                      <div className='flex flex-wrap gap-x-6 gap-y-1.5 mt-2'>
                        <span className='px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest'>x{item.quantity} units</span>
                        {item.size && <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Size: <span className='text-gray-800 dark:text-gray-200'>{item.size}</span></span>}
                        {item.color && <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Color: <span className='text-gray-800 dark:text-gray-200'>{item.color}</span></span>}
                      </div>
                      <p className='text-xl font-black text-indigo-600 dark:text-indigo-400 mt-3'>{currency}{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary in Modal Overhaul */}
              <div className='mt-8 pt-8 border-t border-gray-100 dark:border-gray-800/50 flex flex-col sm:grid sm:grid-cols-2 gap-5'>
                <div className='p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 relative overflow-hidden group'>
                  <p className='text-[10px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-[0.2em] mb-3'>Consignee Metadata</p>
                  <div className='text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed z-10 relative'>
                    <p className="text-gray-900 dark:text-white text-base mb-1">{selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                    <p>{selectedOrder.address.street}</p>
                    <p>{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                    <p>{selectedOrder.address.country} • {selectedOrder.address.zipcode}</p>
                  </div>
                  <svg className="w-20 h-20 absolute -bottom-6 -right-6 text-indigo-100/30 dark:text-indigo-800/10 group-hover:scale-125 transition-transform duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className='p-6 rounded-[2rem] bg-indigo-600 dark:bg-indigo-600 shadow-2xl shadow-indigo-600/30 text-white flex flex-col justify-center items-center sm:items-end text-center sm:text-right relative overflow-hidden'>
                  <p className='text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-1 relative z-10'>Invoice Total</p>
                  <p className='text-4xl font-black text-white relative z-10'>{currency}{selectedOrder.amount.toLocaleString()}</p>
                  <p className='text-[10px] font-black text-indigo-100 uppercase mt-2 opacity-80 relative z-10'>{selectedOrder.paymentMethod} • {selectedOrder.payment ? 'Authorized' : 'Pending'}</p>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                </div>
              </div>
            </div>
            
            <div className='p-8 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800/50 flex justify-end'>
              <button 
                onClick={() => setSelectedOrder(null)}
                className='px-10 py-5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-indigo-600/30 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all'
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Revenue = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenueStats = async () => {
            try {
                const response = await axios.get(backendUrl + '/api/admin/revenue-stats', { headers: { token } });
                if (response.data.success) {
                    setStats(response.data.revenueStats);
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
        if (token) {
            fetchRevenueStats();
        }
    }, [token]);

    if (loading || !stats) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[60vh] gap-6'>
                <div className='relative'>
                    <div className='w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full'></div>
                    <div className='w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                </div>
                <div className='flex flex-col items-center gap-2'>
                    <p className='text-sm font-black text-gray-800 dark:text-white uppercase tracking-[0.3em]'>Loading Data...</p>
                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse'>Please wait while facts sync</p>
                </div>
            </div>
        );
    }

    const categoryData = {
        labels: Object.keys(stats.categoryStats),
        datasets: [
            {
                data: Object.values(stats.categoryStats),
                backgroundColor: [
                    '#6366f1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6'
                ],
                borderWidth: 0,
                hoverOffset: 20
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { 
                position: window.innerWidth < 768 ? 'bottom' : 'right',
                labels: { 
                    color: '#94a3b8', 
                    font: { family: 'Inter', size: 10, weight: '900' },
                    usePointStyle: true,
                    padding: 20
                } 
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 16,
                titleFont: { family: 'Inter', size: 14, weight: '900' },
                bodyFont: { family: 'Inter', size: 12, weight: '700' },
                cornerRadius: 12,
                displayColors: true
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className='flex flex-col w-full items-start gap-10 p-4 sm:p-10 pb-24 sm:pb-40'>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between w-full gap-6'>
                <div className='flex flex-col gap-2'>
                    <h1 className='text-3xl sm:text-4xl font-black text-gray-800 dark:text-white leading-tight tracking-tight'>Financial Overview</h1>
                    <p className='text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1'>View your revenue and growth</p>
                </div>
                <div className='flex items-center gap-3 text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/10 glass-effect w-fit shadow-sm uppercase tracking-widest'>
                    <span className={`w-2.5 h-2.5 rounded-full shadow-lg ${parseFloat(stats.monthlyGrowth) >= 0 ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}></span>
                    Monthly Status: <span className={parseFloat(stats.monthlyGrowth) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{stats.monthlyGrowth}% Growth</span>
                </div>
            </div>

            {/* Top Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full'>
                <div className='glass-effect p-8 rounded-[2rem] border border-white/20 dark:border-white/10 shadow-xl group hover:-translate-y-1 transition-all relative overflow-hidden'>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-500/5 blur-3xl -mr-12 -mt-12"></div>
                    <p className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3'>Gross Revenue</p>
                    <p className='text-2xl sm:text-3xl font-black text-gray-800 dark:text-white tabular-nums'>{currency}{stats.grossRevenue.toLocaleString()}</p>
                </div>
                <div className='glass-effect p-8 rounded-[2rem] border border-indigo-500/10 dark:border-white/10 shadow-xl border-l-[6px] border-l-indigo-600 group hover:-translate-y-1 transition-all relative overflow-hidden'>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl -mr-12 -mt-12"></div>
                    <p className='text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3'>Net Revenue</p>
                    <p className='text-2xl sm:text-3xl font-black text-gray-800 dark:text-white tabular-nums'>{currency}{stats.netRevenue.toLocaleString()}</p>
                </div>
                <div className='glass-effect p-8 rounded-[2rem] border border-rose-500/10 dark:border-white/10 shadow-xl border-l-[6px] border-l-rose-600 group hover:-translate-y-1 transition-all relative overflow-hidden'>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-3xl -mr-12 -mt-12"></div>
                    <p className='text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-3'>Total Refunds</p>
                    <p className='text-2xl sm:text-3xl font-black text-gray-800 dark:text-white tabular-nums'>{currency}{stats.totalRefunds.toLocaleString()}</p>
                </div>
                <div className='glass-effect p-8 rounded-[2rem] border border-emerald-500/10 dark:border-white/10 shadow-xl border-l-[6px] border-l-emerald-600 group hover:-translate-y-1 transition-all relative overflow-hidden'>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl -mr-12 -mt-12"></div>
                    <p className='text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3'>Current Month</p>
                    <p className='text-2xl sm:text-3xl font-black text-gray-800 dark:text-white tabular-nums'>{currency}{stats.currentMonthRevenue.toLocaleString()}</p>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 w-full'>
                {/* Category Sales Doughnut */}
                <div className='glass-effect p-8 sm:p-10 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl flex flex-col min-h-[450px] col-span-2 relative overflow-hidden'>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32"></div>
                    <div className="mb-10">
                        <h3 className='font-black text-xl sm:text-2xl text-gray-800 dark:text-white uppercase tracking-tight'>Category Sales</h3>
                        <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1'>Sales breakdown by category</p>
                    </div>
                    <div className='flex-1 flex items-center justify-center min-h-[300px]'>
                        <Doughnut 
                            data={categoryData} 
                            options={chartOptions} 
                        />
                    </div>
                </div>
            </div>

            {/* Summary Table */}
            <div className='glass-effect rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden w-full'>
                <div className='p-8 sm:p-10 border-b border-gray-100 dark:border-white/10'>
                    <h3 className='font-black text-xl sm:text-2xl text-gray-800 dark:text-white uppercase tracking-tight'>Monthly Performance</h3>
                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1'>Month-over-month comparison</p>
                </div>
                <div className='overflow-x-auto custom-scrollbar'>
                    <table className='w-full text-left'>
                        <thead className='bg-gray-50/50 dark:bg-gray-800/50'>
                            <tr>
                                <th className='px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Time Period</th>
                                <th className='px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Total Revenue</th>
                                <th className='px-10 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 text-center'>Growth Rate</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100 dark:divide-white/10'>
                            <tr className='hover:bg-white/40 dark:hover:bg-gray-800/10 transition-colors'>
                                <td className='px-10 py-7 text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide'>Current Month</td>
                                <td className='px-10 py-7 text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums'>{currency}{stats.currentMonthRevenue.toLocaleString()}</td>
                                <td className='px-10 py-7 text-center'>
                                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${parseFloat(stats.monthlyGrowth) >= 0 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
                                        {stats.monthlyGrowth}%
                                    </span>
                                </td>
                            </tr>
                            <tr className='hover:bg-white/40 dark:hover:bg-gray-800/10 transition-colors'>
                                <td className='px-10 py-7 text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-wide'>Previous Month</td>
                                <td className='px-10 py-7 text-sm font-black text-gray-400 dark:text-gray-500 tabular-nums'>{currency}{stats.lastMonthRevenue.toLocaleString()}</td>
                                <td className='px-10 py-7 text-center'>
                                    <span className='px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-400 border border-transparent'>
                                        Baseline
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Revenue;

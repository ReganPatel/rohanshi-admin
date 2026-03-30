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
import { Line, Bar, Pie } from 'react-chartjs-2';

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

const Dashboard = ({ token }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [revenueFilter, setRevenueFilter] = useState('monthly');
    const [orderStatusFilter, setOrderStatusFilter] = useState('monthly');
    const [topProductsFilter, setTopProductsFilter] = useState('monthly');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { token } });
                if (response.data.success) {
                    setData(response.data.dashboard);
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
            fetchDashboardData();
        }
    }, [token]);

    if (loading || !data) {
        return <div className="flex justify-center items-center h-full min-h-[50vh]"><div className="w-16 h-16 border-4 border-gray-400 border-t-black rounded-full animate-spin"></div></div>;
    }

    // Monthly Sales Chart Data
    const salesDataToUse = data.revenueData[revenueFilter];
    const salesChartData = {
        labels: salesDataToUse.map(item => item.label),
        datasets: [
            {
                label: 'Revenue',
                data: salesDataToUse.map(item => item.revenue),
                borderColor: '#10B981', // green-500
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.3,
            },
        ],
    };

    // Order Status Pie Chart Data
    const orderStatusToUse = data.orderStatusData[orderStatusFilter];
    const orderStatusChartData = {
        labels: Object.keys(orderStatusToUse),
        datasets: [
            {
                data: Object.values(orderStatusToUse),
                backgroundColor: [
                    '#3B82F6', // blue
                    '#F59E0B', // amber
                    '#EF4444', // red
                    '#A855F7', // light purple
                    '#10B981', // green
                    '#EC4899', // pink
                    '#64748b', // slate/grey
                    '#F97316', // orange
                    '#06B6D4', // cyan
                    '#84CC16', // lime
                ],
                borderWidth: 1,
            },
        ],
    };

    // Top Products Bar Chart Data
    const topProductsToUse = data.topProductsData[topProductsFilter];
    const topProductsChartData = {
        labels: topProductsToUse.map(p => p.name.substring(0, 15) + '...'),
        datasets: [
            {
                label: 'Units Sold',
                data: topProductsToUse.map(p => p.count),
                backgroundColor: '#3B82F6', // blue-500
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: { family: 'Inter', size: 12 },
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleFont: { family: 'Inter', size: 14, weight: 'bold' },
                bodyFont: { family: 'Inter', size: 13 },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                displayColors: true,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { 
                    color: '#94a3b8', 
                    font: { family: 'Inter', size: window.innerWidth < 640 ? 9 : 11 },
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: { 
                    color: '#94a3b8', 
                    font: { family: 'Inter', size: window.innerWidth < 640 ? 9 : 11 },
                    callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value
                }
            }
        }
    };

    // Update charts specific options
    const lineChartOptions = {
        ...chartOptions,
        elements: {
            line: { tension: 0.4, borderWidth: 3, borderCapStyle: 'round' },
            point: { radius: 0, hoverRadius: 6, backgroundColor: '#6366f1' }
        }
    };

    const barChartOptions = {
        ...chartOptions,
        indexAxis: 'y',
        scales: {
            x: {
                ...chartOptions.scales.y,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: {
                    ...chartOptions.scales.y.ticks,
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                ...chartOptions.scales.x,
                grid: { display: false },
                ticks: {
                    ...chartOptions.scales.x.ticks,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function(value, index, values) {
                        return this.getLabelForValue(value);
                    }
                }
            }
        },
        elements: {
            bar: { borderRadius: 6, borderSkipped: false }
        }
    };

    return (
        <div className='flex flex-col gap-8 w-full p-2 sm:p-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white'>Dashboard Overview</h1>
                <div className='text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 glass-effect'>
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Metric Cards */}
            <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6'>
                {(() => {
                    const colorClasses = {
                        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
                        rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
                    };

                    return [
                        {
                            label: 'Total Revenue', value: `${currency}${data.totalRevenue.toLocaleString()}`, color: 'indigo', icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 8h12m-6 5l8.5 8M6 13h3m0 0c6.667 0 6.667-10 0-10" /></svg>
                            )
                        },
                        {
                            label: 'Total Orders', value: data.totalOrders, color: 'blue', icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            )
                        },
                        {
                            label: 'Total Products', value: data.totalProducts, color: 'purple', icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            )
                        },
                        {
                            label: 'Total Customers', value: data.totalCustomers, color: 'emerald', icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            )
                        },
                        {
                            label: 'Return Products', value: data.totalReturnProducts || 0, color: 'rose', icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path></svg>
                            )
                        }
                    ].map((card, i) => (
                        <div key={i} className='glass-effect p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300'>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[card.color]} group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1'>{card.label}</p>
                                <p className='text-2xl font-black text-gray-800 dark:text-white'>{card.value}</p>
                            </div>
                        </div>
                    ));
                })()}
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>

                {/* Sales Trend Line Chart */}
                <div className='glass-effect p-4 sm:p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl xl:col-span-2 flex flex-col min-h-[300px] sm:min-h-[450px]'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
                        <div>
                            <h3 className='font-bold text-lg sm:text-xl text-gray-800 dark:text-white'>Revenue Analytics</h3>
                            <p className='text-[10px] sm:text-sm text-gray-500 dark:text-gray-400'>Tracking sales performance over time</p>
                        </div>
                        <div className='flex w-full sm:w-auto bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700'>
                            {['weekly', 'monthly', 'yearly'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setRevenueFilter(f)}
                                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${revenueFilter === f ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='flex-1 relative'>
                        <Line
                            data={{
                                ...salesChartData,
                                datasets: [{
                                    ...salesChartData.datasets[0],
                                    borderColor: '#6366f1',
                                    backgroundColor: (context) => {
                                        const ctx = context.chart.ctx;
                                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
                                        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                                        return gradient;
                                    },
                                    fill: true,
                                    pointBackgroundColor: '#fff',
                                    pointBorderColor: '#6366f1',
                                    pointBorderWidth: 2,
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                }]
                            }}
                            options={lineChartOptions}
                        />
                    </div>
                </div>

                {/* Order Status Pie Chart */}
                <div className='glass-effect p-4 sm:p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl flex flex-col min-h-[350px] sm:min-h-[450px]'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
                        <div>
                            <h3 className='font-bold text-lg sm:text-xl text-gray-800 dark:text-white'>Order Distribution</h3>
                            <p className='text-[10px] sm:text-sm text-gray-500 dark:text-gray-400'>Status breakdown</p>
                        </div>
                        <select
                            value={orderStatusFilter}
                            onChange={(e) => setOrderStatusFilter(e.target.value)}
                            className='text-[10px] sm:text-xs font-bold bg-transparent border-none outline-none text-indigo-600 dark:text-indigo-400 cursor-pointer lg:mr-2'
                        >
                            <option value="weekly">Weekly View</option>
                            <option value="monthly">Monthly View</option>
                            <option value="yearly">Yearly View</option>
                        </select>
                    </div>
                    <div className='flex-1 flex flex-col items-center justify-center relative min-h-[300px]'>
                        <div className='w-full h-full flex-1 relative'>
                            <div className='absolute inset-0 flex items-center justify-center flex-col pointer-events-none'>
                                <span className='text-3xl font-black text-gray-800 dark:text-white'>{data.totalOrders}</span>
                                <span className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Total</span>
                            </div>
                            <Pie
                                data={{
                                    ...orderStatusChartData,
                                    datasets: [{
                                        ...orderStatusChartData.datasets[0],
                                        borderWidth: 0,
                                        hoverOffset: 15,
                                        spacing: 5,
                                        borderRadius: 10
                                    }]
                                }}
                                options={{
                                    ...chartOptions,
                                    cutout: '75%',
                                    plugins: {
                                        ...chartOptions.plugins,
                                        legend: { display: false }
                                    },
                                    scales: {
                                        x: { 
                                            display: true,
                                            grid: { color: 'rgba(148, 163, 184, 0.1)', display: true },
                                            ticks: { display: true, color: '#94a3b8', font: { size: 10 } }
                                        },
                                        y: { 
                                            display: true,
                                            grid: { color: 'rgba(148, 163, 184, 0.1)', display: true },
                                            ticks: { display: true, color: '#94a3b8', font: { size: 10 } }
                                        }
                                    }
                                }}
                            />
                        </div>
                        
                        {/* Custom Legend */}
                        <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 w-full'>
                            {Object.keys(orderStatusToUse).map((status, index) => (
                                <div key={status} className='flex items-center gap-2'>
                                    <div 
                                        className='w-3 h-3 rounded-full shrink-0' 
                                        style={{ backgroundColor: orderStatusChartData.datasets[0].backgroundColor[index] }}
                                    ></div>
                                    <span className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate'>
                                        {status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Top Products Bar Chart */}
            <div className='glass-effect p-4 sm:p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl flex flex-col min-h-[300px] sm:min-h-[500px]'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
                    <div>
                        <h3 className='font-bold text-lg sm:text-xl text-gray-800 dark:text-white'>Market Performance</h3>
                        <p className='text-[10px] sm:text-sm text-gray-500 dark:text-gray-400'>Top selling products ranking</p>
                    </div>
                    <div className='flex w-full sm:w-auto bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700'>
                        {['weekly', 'monthly', 'yearly'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setTopProductsFilter(f)}
                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${topProductsFilter === f ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='flex-1 relative'>
                    <Bar
                        data={{
                            ...topProductsChartData,
                            datasets: [{
                                ...topProductsChartData.datasets[0],
                                backgroundColor: '#6366f1',
                                hoverBackgroundColor: '#4f46e5',
                                borderRadius: 8,
                                maxBarThickness: 32,
                                barPercentage: 0.7
                            }]
                        }}
                        options={barChartOptions}
                    />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;

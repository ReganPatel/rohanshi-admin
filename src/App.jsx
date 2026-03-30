import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import HomeSettings from './pages/HomeSettings'
import Coupons from './pages/Coupons'
import Returns from './pages/Returns'
import Revenue from './pages/Revenue'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₹'

const App = () => {

  const [token, setToken] = useState(sessionStorage.getItem('token') ? sessionStorage.getItem('token') : '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('token', token)
  }, [token])

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // We conditionally apply the 'dark' class to the outermost wrapping div
  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className='min-h-screen transition-colors duration-500 ease-in-out dark:bg-gray-900 dark:text-gray-100 bg-gray-50 text-gray-800'>
        <ToastContainer />
        {token === ""
          ? <Login setToken={setToken} />
          : <>
            <Navbar setToken={setToken} theme={theme} setTheme={setTheme} setShowSidebar={setShowSidebar} />
            <div className='flex w-full min-h-[calc(100vh-64px)] relative'>
              {/* Sidebar Wrapper with Mobile Responsiveness */}
              <div className={`
                fixed md:sticky top-[64px] left-0 z-40 h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 ease-in-out
                ${showSidebar ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-64'}
              `}>
                <Sidebar token={token} setShowSidebar={setShowSidebar} />
              </div>

              {/* Mobile Overlay */}
              {showSidebar && (
                <div 
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
                  onClick={() => setShowSidebar(false)}
                ></div>
              )}

              <div className='flex-1 mx-auto my-4 sm:my-8 text-gray-600 text-base px-2 sm:px-6 md:px-8 lg:px-12 w-full max-w-[1400px]'>
                <Routes>
                  <Route path='/' element={<Dashboard token={token} />} />
                  <Route path='/dashboard' element={<Dashboard token={token} />} />
                  <Route path='/add' element={<Add token={token} />} />
                  <Route path='/list' element={<List token={token} />} />
                  <Route path='/orders' element={<Orders token={token} />} />
                  <Route path='/customers' element={<Customers token={token} />} />
                  <Route path='/home-settings' element={<HomeSettings token={token} />} />
                  <Route path='/coupons' element={<Coupons token={token} />} />
                  <Route path='/returns' element={<Returns token={token} />} />
                  <Route path='/revenue' element={<Revenue token={token} />} />
                </Routes>
              </div>
            </div>
          </>
        }

      </div>
    </div>
  )
}

export default App
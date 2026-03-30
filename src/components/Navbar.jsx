import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken, theme, setTheme, setShowSidebar }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    <div className='flex items-center h-16 px-4 sm:px-[4%] justify-between sticky top-0 z-50 glass-effect border-b dark:border-gray-800 transition-all duration-300'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <button 
          onClick={() => setShowSidebar(prev => !prev)}
          className='md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img className='w-16 sm:w-28 md:w-32 filter dark:invert transition-all duration-500 hover:scale-105 cursor-pointer' src={assets.logo} alt="" />
      </div>
      <div className='flex items-center gap-3 sm:gap-5'>
        <button
          onClick={toggleTheme}
          className={`relative w-10 sm:w-14 h-5 sm:h-7 rounded-full transition-all duration-500 ease-in-out flex items-center p-0.5 sm:p-1 ${theme === 'light' ? 'bg-indigo-100' : 'bg-gray-800 border border-gray-700'}`}
          title="Toggle Theme"
        >
          <div className="absolute w-full px-1 sm:px-2 flex justify-between items-center z-0 left-0 scale-75 sm:scale-100">
            <span className={`text-indigo-500 transition-opacity duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </span>
            <span className={`text-indigo-300 transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </span>
          </div>
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-sm z-10 transform transition-transform duration-500 ease-in-out ${theme === 'light' ? 'translate-x-[1.25rem] sm:translate-x-7 bg-indigo-600' : 'translate-x-0 bg-indigo-400'}`}>
          </div>
        </button>
        <button onClick={() => setToken('')} className='bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-xs font-semibold transition-all duration-300 shadow-sm whitespace-nowrap'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar
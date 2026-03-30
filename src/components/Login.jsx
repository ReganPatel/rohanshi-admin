import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Login = ({ setToken }) => {
    const [state, setState] = useState('Login') // Login, OTP, ForgotPassword, ResetPassword
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            if (state === 'Login') {
                const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
                if (response.data.success && response.data.pendingVerification) {
                    toast.success(response.data.message)
                    setState('OTP')
                } else if (response.data.success) {
                    setToken(response.data.token)
                } else {
                    toast.error(response.data.message)
                }
            } else if (state === 'OTP') {
                const response = await axios.post(backendUrl + '/api/user/admin/verify', { email, otp })
                if (response.data.success) {
                    toast.success(response.data.message)
                    setToken(response.data.token)
                } else {
                    toast.error(response.data.message)
                }
            } else if (state === 'ForgotPassword') {
                const response = await axios.post(backendUrl + '/api/user/admin/forgot-password', { email })
                if (response.data.success) {
                    toast.success(response.data.message)
                    setState('ResetPassword')
                } else {
                    toast.error(response.data.message)
                }
            } else if (state === 'ResetPassword') {
                const response = await axios.post(backendUrl + '/api/user/admin/reset-password', { email, otp, newPassword })
                if (response.data.success) {
                    toast.success(response.data.message)
                    setState('Login')
                } else {
                    toast.error(response.data.message)
                }
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full p-4 bg-gray-50 dark:bg-gray-950 relative overflow-hidden'>
            {/* Background Decorative Elements */}
            <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]'></div>
            <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]'></div>

            <div className='glass-effect rounded-[2rem] border border-white/20 dark:border-white/10 shadow-2xl p-8 md:p-12 w-full max-w-md relative z-10 hover:shadow-indigo-500/10 transition-shadow duration-500'>
                <div className='flex flex-col items-center mb-10'>
                    <div className='w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40 mb-6'>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h1 className='text-3xl font-black text-gray-800 dark:text-white text-center'>
                        {state === 'Login' ? 'Admin Portal' : state === 'OTP' ? 'Verify Identity' : state === 'ForgotPassword' ? 'Account Recovery' : 'Secure Reset'}
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium text-center uppercase tracking-widest'>
                        {state === 'Login' ? 'Authentication Required' : 'Authorization Step'}
                    </p>
                </div>

                <form onSubmit={onSubmitHandler} className='space-y-6'>
                    <div>
                        <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-2 px-1'>Email Id</p>
                        <div className='relative group'>
                            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"></path></svg>
                            </div>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                disabled={state === 'OTP' || state === 'ResetPassword'}
                                className='w-full pl-11 pr-4 py-4 dark:bg-gray-900/50 dark:text-white rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 disabled:opacity-50'
                                type="email"
                                placeholder='Enter your Email ID'
                                required
                            />
                        </div>
                    </div>

                    {state === 'Login' && (
                        <div>
                            <div className='flex items-center justify-between mb-2 px-1'>
                                <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em]'>Password</p>
                                <button type="button" onClick={() => setState('ForgotPassword')} className='text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-600 tracking-widest'>Forget Password?</button>
                            </div>
                            <div className='relative group'>
                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                    <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    className='w-full pl-11 pr-4 py-4 dark:bg-gray-900/50 dark:text-white rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600'
                                    type="password"
                                    placeholder='••••••••'
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {(state === 'OTP' || state === 'ResetPassword') && (
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-2 px-1 text-center'>Enter 6-Digit Verification Code</p>
                            <input
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                                className='w-full py-5 dark:bg-gray-900/50 dark:text-white rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all font-black text-center tracking-[0.5em] text-2xl placeholder:text-gray-200 dark:placeholder:text-gray-700'
                                type="text"
                                maxLength={6}
                                placeholder='000000'
                                required
                            />
                        </div>
                    )}

                    {state === 'ResetPassword' && (
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-2 px-1'>New Password</p>
                            <div className='relative group'>
                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                    <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <input
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    value={newPassword}
                                    className='w-full pl-11 pr-4 py-4 dark:bg-gray-900/50 dark:text-white rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600'
                                    type="password"
                                    placeholder='••••••••'
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button
                        className='w-full py-4 px-6 rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center gap-2 group'
                        type="submit"
                    >
                        {state === 'Login' ? 'Access Portal' : state === 'OTP' ? 'Verify Code' : state === 'ForgotPassword' ? 'Request Link' : 'Commit Reset'}
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </button>

                    {(state === 'OTP' || state === 'ForgotPassword' || state === 'ResetPassword') && (
                        <div className='text-center pt-2'>
                            <button
                                type="button"
                                onClick={() => {
                                    setState('Login');
                                    setOtp('');
                                }}
                                className='text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 tracking-widest transition-colors'
                            >
                                Return to Credentials
                            </button>
                        </div>
                    )}
                </form>
            </div>


        </div>
    )
}

export default Login
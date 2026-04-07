import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const HomeSettings = ({ token }) => {
    const [products, setProducts] = useState([])
    const [latestProducts, setLatestProducts] = useState([])
    const [bestsellerProducts, setBestsellerProducts] = useState([])
    const [existingHeroImages, setExistingHeroImages] = useState([])
    const [newHeroImages, setNewHeroImages] = useState([])
    const [facebookLink, setFacebookLink] = useState('')
    const [instagramLink, setInstagramLink] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactPhone, setContactPhone] = useState('')

    const fetchConfig = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/siteConfig')
            if (response.data.success) {
                const config = response.data.config
                setLatestProducts(config.latestProducts || [])
                setBestsellerProducts(config.bestsellerProducts || [])
                setExistingHeroImages(config.heroImages || [])
                setFacebookLink(config.facebookLink || '')
                setInstagramLink(config.instagramLink || '')
                setContactEmail(config.contactEmail || '')
                setContactPhone(config.contactPhone || '')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchConfig()
        fetchProducts()
    }, [])

    const toggleLatestProduct = (id) => {
        if (latestProducts.includes(id)) {
            setLatestProducts(latestProducts.filter(item => item !== id))
        } else {
            setLatestProducts([...latestProducts, id])
        }
    }

    const toggleBestsellerProduct = (id) => {
        if (bestsellerProducts.includes(id)) {
            setBestsellerProducts(bestsellerProducts.filter(item => item !== id))
        } else {
            setBestsellerProducts([...bestsellerProducts, id])
        }
    }

    const removeExistingImage = (indexToRemove) => {
        setExistingHeroImages(existingHeroImages.filter((_, index) => index !== indexToRemove))
    }

    const removeNewImage = (indexToRemove) => {
        setNewHeroImages(Array.from(newHeroImages).filter((_, index) => index !== indexToRemove))
    }

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files)

        // Let's cap total combined images to 10
        if (existingHeroImages.length + newHeroImages.length + selectedFiles.length > 10) {
            toast.error("You can only have up to 10 hero images maximum.")
            return
        }

        setNewHeroImages([...newHeroImages, ...selectedFiles])
    }


    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {
            const formData = new FormData()

            formData.append('latestProducts', JSON.stringify(latestProducts))
            formData.append('bestsellerProducts', JSON.stringify(bestsellerProducts))
            formData.append('facebookLink', facebookLink)
            formData.append('instagramLink', instagramLink)
            formData.append('contactEmail', contactEmail)
            formData.append('contactPhone', contactPhone)

            // Append each existing image URL (if none, it won't append)
            existingHeroImages.forEach(imgUrl => {
                formData.append('existingHeroImages', imgUrl)
            })

            // Append each new file
            newHeroImages.forEach(file => {
                formData.append('newHeroImages', file)
            })

            const response = await axios.post(backendUrl + '/api/siteConfig', formData, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                fetchConfig() // Refresh state
                setNewHeroImages([]) // Clear out new pending uploads
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-10 p-4 sm:p-10 pb-24 sm:pb-40'>
            <div className='w-full'>
                <h1 className='text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 leading-tight tracking-tight'>Store Settings</h1>
                <p className='text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1'>Manage your homepage content</p>

                {/* Hero Management Card */}
                <div className='glass-effect p-8 sm:p-10 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl mb-10'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10'>
                        <div>
                            <h2 className='text-xl sm:text-2xl font-black text-gray-800 dark:text-white'>Hero Banners</h2>
                            <p className='text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest mt-1'>Update homepage slider images</p>
                        </div>
                        <span className='px-6 py-2 bg-indigo-600 shadow-2xl shadow-indigo-600/20 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase border border-white/10 w-fit'>
                            {existingHeroImages.length + newHeroImages.length} / 10 Images
                        </span>
                    </div>

                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'>
                        {/* Render Existing Images */}
                        {existingHeroImages.map((imgUrl, index) => (
                            <div key={index} className='relative group aspect-square'>
                                <div className='w-full h-full rounded-[1.5rem] overflow-hidden border-2 border-white/10 group-hover:border-indigo-500 transition-all shadow-xl'>
                                    <img className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' src={imgUrl} alt="Hero" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(index)}
                                    className='absolute -top-2 -right-2 bg-rose-600 text-white rounded-xl w-8 h-8 flex items-center justify-center text-lg font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95'
                                >
                                    &times;
                                </button>
                            </div>
                        ))}

                        {/* Render Pending New Images */}
                        {newHeroImages.map((file, index) => (
                            <div key={'new-' + index} className='relative group aspect-square'>
                                <div className='w-full h-full rounded-[1.5rem] overflow-hidden border-2 border-indigo-500/50 shadow-xl relative'>
                                    <img className='w-full h-full object-cover' src={URL.createObjectURL(file)} alt="New Hero" />
                                    <div className='absolute inset-0 bg-indigo-600/40 backdrop-blur-[2px] flex items-center justify-center'>
                                        <span className='text-[10px] font-black text-white uppercase tracking-[0.2em] bg-indigo-600 px-3 py-1 rounded-xl shadow-lg'>Draft</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className='absolute -top-2 -right-2 bg-rose-600 text-white rounded-xl w-8 h-8 flex items-center justify-center text-lg font-black shadow-2xl transform hover:scale-110 active:scale-95'
                                >
                                    &times;
                                </button>
                            </div>
                        ))}

                        {/* Modern Upload Button */}
                        {(existingHeroImages.length + newHeroImages.length < 10) && (
                            <label htmlFor="image" className='cursor-pointer group aspect-square'>
                                <div className='w-full h-full rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center bg-gray-50/30 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500'>
                                    <div className='w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all'>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    </div>
                                    <span className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-indigo-600'>Insert Media</span>
                                </div>
                                <input type="file" id="image" hidden multiple onChange={handleImageChange} accept="image/*" />
                            </label>
                        )}
                    </div>
                </div>

                {/* Contact & Social media Section */}
                <div className='glass-effect p-8 sm:p-10 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl mb-10 relative overflow-hidden'>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl -mr-24 -mt-24"></div>
                    <div className="mb-10">
                        <h2 className='text-xl sm:text-2xl font-black text-gray-800 dark:text-white'>Contact & Social Hub</h2>
                        <p className='text-[10px] sm:text-xs text-gray-400 font-black uppercase tracking-widest mt-1'>Direct links to your brand community</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Instagram URL</p>
                            <input
                                type="text"
                                value={instagramLink}
                                onChange={(e) => setInstagramLink(e.target.value)}
                                placeholder="https://instagram.com/yourbrand"
                                className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold shadow-sm'
                            />
                        </div>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Facebook URL</p>
                            <input
                                type="text"
                                value={facebookLink}
                                onChange={(e) => setFacebookLink(e.target.value)}
                                placeholder="https://facebook.com/yourbrand"
                                className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold shadow-sm'
                            />
                        </div>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Support Email</p>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="support@yourbrand.com"
                                className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold shadow-sm'
                            />
                        </div>
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 px-1'>Support Phone</p>
                            <input
                                type="text"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="+91 12345 67890"
                                className='w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-2xl dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold shadow-sm'
                            />
                        </div>
                    </div>
                </div>

                {/* Product Selection Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {/* Latest Section */}
                    <div className='glass-effect p-8 sm:p-10 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col'>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16"></div>
                        <h3 className='text-xl font-black text-gray-800 dark:text-white mb-1 px-1'>New Arrivals</h3>
                        <p className='text-[10px] text-gray-400 font-black uppercase tracking-widest mb-8 px-1'>Highlight your latest drops</p>

                        <div className='h-[450px] overflow-y-auto pr-3 custom-scrollbar flex flex-col gap-4'>
                            {products.map(product => (
                                <label key={product._id} className={`flex shrink-0 items-center gap-5 p-4 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${latestProducts.includes(product._id) ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-600/30' : 'bg-white/50 border-white/20 dark:bg-gray-900/30 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'}`}>
                                    <div className="relative z-10 shrink-0">
                                        <input
                                            type="checkbox"
                                            className='hidden'
                                            checked={latestProducts.includes(product._id)}
                                            onChange={() => toggleLatestProduct(product._id)}
                                        />
                                        <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${latestProducts.includes(product._id) ? 'bg-white border-white scale-110' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                            {latestProducts.includes(product._id) && <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                                        </div>
                                    </div>
                                    <img className='w-16 h-16 shrink-0 object-cover rounded-2xl shadow-xl border-2 border-white/10 group-hover:scale-105 transition-transform relative z-10' src={product.image[0]} alt={product.name} />
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className={`text-sm font-black line-clamp-2 uppercase tracking-tight leading-tight ${latestProducts.includes(product._id) ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{product.name}</p>
                                        <p className={`text-[10px] font-black uppercase mt-1.5 opacity-80 ${latestProducts.includes(product._id) ? 'text-indigo-100' : 'text-gray-400'}`}>{product.category} • {currency}{product.price.toLocaleString()}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Bestseller Section */}
                    <div className='glass-effect p-8 sm:p-10 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col'>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -mr-16 -mt-16"></div>
                        <h3 className='text-xl font-black text-gray-800 dark:text-white mb-1 px-1'>Bestsellers</h3>
                        <p className='text-[10px] text-gray-400 font-black uppercase tracking-widest mb-8 px-1'>Display customer favorites</p>

                        <div className='h-[450px] overflow-y-auto pr-3 custom-scrollbar flex flex-col gap-4'>
                            {products.map(product => (
                                <label key={product._id} className={`flex shrink-0 items-center gap-5 p-4 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${bestsellerProducts.includes(product._id) ? 'bg-rose-600 border-rose-600 shadow-2xl shadow-rose-600/30' : 'bg-white/50 border-white/20 dark:bg-gray-900/30 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'}`}>
                                    <div className="relative z-10 shrink-0">
                                        <input
                                            type="checkbox"
                                            className='hidden'
                                            checked={bestsellerProducts.includes(product._id)}
                                            onChange={() => toggleBestsellerProduct(product._id)}
                                        />
                                        <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${bestsellerProducts.includes(product._id) ? 'bg-white border-white scale-110' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                            {bestsellerProducts.includes(product._id) && <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                                        </div>
                                    </div>
                                    <img className='w-16 h-16 shrink-0 object-cover rounded-2xl shadow-xl border-2 border-white/10 group-hover:scale-105 transition-transform relative z-10' src={product.image[0]} alt={product.name} />
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className={`text-sm font-black line-clamp-2 uppercase tracking-tight leading-tight ${bestsellerProducts.includes(product._id) ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{product.name}</p>
                                        <p className={`text-[10px] font-black uppercase mt-1.5 opacity-80 ${bestsellerProducts.includes(product._id) ? 'text-rose-100' : 'text-gray-400'}`}>{product.category} • {currency}{product.price.toLocaleString()}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='flex justify-center sm:justify-end mt-16 scale-110 sm:scale-100'>
                    <button type="submit" className='w-full sm:w-auto px-16 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/40 transform hover:-translate-y-1.5 active:scale-95 transition-all text-xs border border-white/10'>
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    )
}

export default HomeSettings

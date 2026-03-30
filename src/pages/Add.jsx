import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Add = ({ token }) => {

    const [images, setImages] = useState([null])

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("Men");
    const [subCategory, setSubCategory] = useState("Anklets");
    const [hasSizes, setHasSizes] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [hasColors, setHasColors] = useState(false);
    const [colors, setColors] = useState([]);
    const [colorStock, setColorStock] = useState({});
    const [sizeStock, setSizeStock] = useState({});
    const [colorImages, setColorImages] = useState({});
    const [newColorInput, setNewColorInput] = useState('');
    const [newSizeInput, setNewSizeInput] = useState('');
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {

            const formData = new FormData()

            formData.append("name", name)
            formData.append("description", description)
            formData.append("originalPrice", originalPrice)
            formData.append("price", price)
            formData.append("category", category)
            formData.append("subCategory", subCategory)
            formData.append("stock", stock)
            formData.append("sizes", JSON.stringify(hasSizes ? sizes : []))
            if (Number(stock) < 0) {
                toast.error("Total stock cannot be negative");
                return;
            }

            if (hasColors) {
                for (const color in colorStock) {
                    if (Number(colorStock[color]) < 0) {
                        toast.error(`Stock for color ${color} cannot be negative`);
                        return;
                    }
                }
            }

            if (hasSizes) {
                for (const size in sizeStock) {
                    if (Number(sizeStock[size]) < 0) {
                        toast.error(`Stock for size ${size} cannot be negative`);
                        return;
                    }
                }
            }

            formData.append("colors", JSON.stringify(hasColors ? colors : []))
            formData.append("colorStock", JSON.stringify(hasColors ? colorStock : {}))
            formData.append("sizeStock", JSON.stringify(hasSizes ? sizeStock : {}))

            let nextIndex = images.filter(img => img).length;
            const colorImageIndices = {};

            // Filter out nulls/falsy values from the images state
            const filteredImages = images.filter(img => img !== null);
            
            // Reorder so that mainImageIndex (clamped to filtered length) is at index 0
            if (filteredImages.length > 0) {
                const actualMainIndex = Math.min(mainImageIndex, filteredImages.length - 1);
                const mainImage = filteredImages.splice(actualMainIndex, 1)[0];
                filteredImages.unshift(mainImage);
            }

            filteredImages.forEach((image) => {
                formData.append("images", image)
            })

            if (hasColors) {
                for (const color of colors) {
                    if (colorImages[color]) {
                        formData.append("images", colorImages[color]);
                        colorImageIndices[color] = nextIndex;
                        nextIndex++;
                    }
                }
            }

            formData.append("colorImageIndices", JSON.stringify(hasColors ? colorImageIndices : {}))

            const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                setName('')
                setDescription('')
                setImages([null])
                setOriginalPrice('')
                setPrice('')
                setStock('')
                setColors([])
                setColorStock({})
                setSizeStock({})
                setColorImages({})
                setMainImageIndex(0)
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            toast.error(error.message)

        }
    }

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (droppedFiles.length > 0) {
            const existingImages = images.filter(img => img !== null);
            const combined = [...existingImages, ...droppedFiles];
            if (combined.length < 10) {
                combined.push(null);
            }
            setImages(combined);
        }
    };



    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4 sm:gap-8 px-1 sm:px-4 pb-20 sm:pb-32'>
            <div className='w-full'>
                <h1 className='text-2xl sm:text-3xl font-black text-gray-800 dark:text-white mb-2'>Add New Product</h1>
                <p className='text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-8'>Create a new product</p>
                
                <div className='glass-effect p-4 sm:p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl w-full max-w-[900px]'>
                    <div className='mb-8'>
                        <p className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4'>Product Images</p>
                        <div 
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex gap-3 sm:gap-4 flex-wrap p-3 sm:p-4 rounded-xl transition-all border-2 border-dashed relative ${isDragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-transparent'}`}
                        >
                            {isDragging && (
                                <div className='absolute inset-0 flex items-center justify-center bg-indigo-500/10 backdrop-blur-[2px] z-10 rounded-xl pointer-events-none'>
                                    <p className='text-indigo-600 dark:text-indigo-400 font-bold animate-bounce'>Drop Images Here</p>
                                </div>
                            )}
                            {images.map((image, index) => (
                                <div key={index} className='relative group'>
                                    <label htmlFor={`image${index}`} className='cursor-pointer block w-full'>
                                        <div className='w-full h-24 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 group'>
                                            <img className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                                        </div>
                                        <input onChange={(e) => {
                                            const newFiles = Array.from(e.target.files);
                                            if (newFiles.length > 0) {
                                                const existingImages = images.filter((img, i) => img !== null && i !== index);
                                                const combined = [...existingImages, ...newFiles];
                                                if (combined.length < 10 && combined[combined.length - 1] !== null) {
                                                    combined.push(null);
                                                }
                                                setImages(combined);
                                            }
                                        }} type="file" id={`image${index}`} hidden multiple />
                                    </label>
                                    {image && (
                                        <div className="absolute bottom-1 left-1 flex gap-1">
                                            <button 
                                                type="button"
                                                onClick={() => setMainImageIndex(index)}
                                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all shadow-md ${mainImageIndex === index ? 'bg-indigo-600 text-white' : 'bg-white/80 dark:bg-black/80 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-black'}`}
                                            >
                                                {mainImageIndex === index ? 'Main' : 'Set Main'}
                                            </button>
                                        </div>
                                    )}
                                    {image && (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const newImages = images.filter((_, i) => i !== index);
                                                if (newImages.length === 0) newImages.push(null);
                                                setImages(newImages);
                                                if (mainImageIndex === index) setMainImageIndex(0);
                                                else if (mainImageIndex > index) setMainImageIndex(prev => prev - 1);
                                            }}
                                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-lg hover:bg-red-600 z-20'
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {images.length < 10 && images[images.length - 1] !== null && (
                                <div onClick={() => setImages([...images, null])} className='w-full sm:w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-indigo-50 dark:border-gray-600 dark:hover:bg-indigo-900/20 transition-all group'>
                                    <span className='text-2xl font-light text-gray-400 group-hover:text-indigo-500'>+</span>
                                    <span className='text-[10px] text-gray-400 group-hover:text-indigo-500 font-medium'>Add More</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-6'>
                        <div className='w-full'>
                            <p className='text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-2 px-1'>Product Name</p>
                            <input onChange={(e) => setName(e.target.value)} value={name} className='w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200 font-bold placeholder:font-normal' type="text" placeholder='Enter product title' required />
                        </div>

                        <div className='w-full'>
                            <p className='text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-2 px-1'>Product Description</p>
                            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200 min-h-[140px] font-medium leading-relaxed' placeholder='Describe the product details...' required />
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                            <div>
                                <p className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>Category</p>
                                <select onChange={(e) => setCategory(e.target.value)} className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200 appearance-none cursor-pointer'>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Kids">Kids</option>
                                </select>
                            </div>

                            <div>
                                <p className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>Sub Category</p>
                                <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200 appearance-none cursor-pointer'>
                                    <option value="Anklets">Anklets</option>
                                    <option value="Bangles">Bangles</option>
                                    <option value="Bracelets">Bracelets</option>
                                    <option value="Brooches">Brooches</option>
                                    <option value="Earrings">Earrings</option>
                                    <option value="Hair accessories">Hair accessories</option>
                                    <option value="Necklaces">Necklaces</option>
                                    <option value="Nose Rings">Nose Rings</option>
                                    <option value="Rings">Rings</option>
                                    <option value="Toe Rings">Toe Rings</option>
                                </select>
                            </div>

                            <div>
                                <p className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>Total Stock</p>
                                <input onChange={(e) => setStock(e.target.value)} value={stock} className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200' type="Number" placeholder='e.g. 100' required min="0" />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            <div>
                                <p className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>Old Price (MRP)</p>
                                <div className='relative'>
                                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>{currency}</span>
                                    <input onChange={(e) => setOriginalPrice(e.target.value)} value={originalPrice} className='w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200' type="Number" placeholder='0.00' />
                                </div>
                            </div>

                            <div>
                                <p className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>Sale Price</p>
                                <div className='relative'>
                                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>{currency}</span>
                                    <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200 font-bold' type="Number" placeholder='0.00' required />
                                </div>
                            </div>
                        </div>

                        <div className='space-y-6 pt-4'>
                            {/* Sizes Section */}
                            <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800'>
                                <div className='flex items-center justify-between mb-4'>
                                    <label className='flex items-center gap-3 cursor-pointer group' htmlFor='hasSizes'>
                                        <div className='relative inline-flex items-center'>
                                            <input type="checkbox" id='hasSizes' className='sr-only peer' onChange={() => setHasSizes(prev => !prev)} checked={hasSizes} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                        </div>
                                        <span className='text-sm font-bold text-gray-700 dark:text-gray-300 select-none'>Enable Sizes</span>
                                    </label>
                                </div>

                                {hasSizes && (
                                    <div className='animate-in fade-in slide-in-from-top-2 duration-300'>
                                        <div className="flex items-center gap-2 max-w-md">
                                            <input
                                                value={newSizeInput}
                                                onChange={(e) => setNewSizeInput(e.target.value)}
                                                className='flex-1 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200'
                                                type="text"
                                                placeholder='Enter size (e.g. 7 inch, XL)'
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (newSizeInput.trim() && !sizes.includes(newSizeInput.trim())) {
                                                            const trimmedSize = newSizeInput.trim();
                                                            setSizes([...sizes, trimmedSize]);
                                                            setSizeStock({ ...sizeStock, [trimmedSize]: 0 });
                                                            setNewSizeInput('');
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (newSizeInput.trim() && !sizes.includes(newSizeInput.trim())) {
                                                        const trimmedSize = newSizeInput.trim();
                                                        setSizes([...sizes, trimmedSize]);
                                                        setSizeStock({ ...sizeStock, [trimmedSize]: 0 });
                                                        setNewSizeInput('');
                                                    }
                                                }}
                                                className='bg-indigo-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20'
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                            </button>
                                        </div>
                                        {sizes.length > 0 && (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4'>
                                                {sizes.map((s, i) => (
                                                    <div key={i} className='bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
                                                        <div className='flex items-center justify-between mb-2'>
                                                            <span className='text-xs font-bold text-indigo-600 dark:text-indigo-400'>{s}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSizes(sizes.filter(size => size !== s));
                                                                    const newSizeStock = { ...sizeStock };
                                                                    delete newSizeStock[s];
                                                                    setSizeStock(newSizeStock);
                                                                }}
                                                                className='text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-full transition-all'
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            </button>
                                                        </div>
                                                        <div className='flex flex-col'>
                                                            <label className='text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block'>In Stock</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={Math.max(0, Number(stock || 0) - Object.entries(sizeStock).reduce((sum, [sz, val]) => sz !== s ? sum + (Number(val) || 0) : sum, 0))}
                                                                value={sizeStock[s] !== undefined ? sizeStock[s] : ''}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    const maxAllowed = Math.max(0, Number(stock || 0) - Object.entries(sizeStock).reduce((sum, [sz, v]) => sz !== s ? sum + (Number(v) || 0) : sum, 0));
                                                                    if (val > maxAllowed) {
                                                                        toast.warning(`Total stock limit reached (${maxAllowed} remaining)`);
                                                                        setSizeStock({ ...sizeStock, [s]: maxAllowed });
                                                                    } else {
                                                                        setSizeStock({ ...sizeStock, [s]: val });
                                                                    }
                                                                }}
                                                                className='w-full px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all text-xs'
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Colors Section */}
                            <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800'>
                                <div className='flex items-center justify-between mb-4'>
                                    <label className='flex items-center gap-3 cursor-pointer group' htmlFor='hasColors'>
                                        <div className='relative inline-flex items-center'>
                                            <input type="checkbox" id='hasColors' className='sr-only peer' onChange={() => setHasColors(prev => !prev)} checked={hasColors} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                                        </div>
                                        <span className='text-sm font-bold text-gray-700 dark:text-gray-300 select-none'>Enable Colors</span>
                                    </label>
                                </div>

                                {hasColors && (
                                    <div className='animate-in fade-in slide-in-from-top-2 duration-300'>
                                        <div className="flex items-center gap-2 max-w-md">
                                            <input
                                                value={newColorInput}
                                                onChange={(e) => setNewColorInput(e.target.value)}
                                                className='flex-1 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200'
                                                type="text"
                                                placeholder='Enter color name'
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (newColorInput.trim() && !colors.includes(newColorInput.trim())) {
                                                            setColors([...colors, newColorInput.trim()]);
                                                            setColorStock({ ...colorStock, [newColorInput.trim()]: 0 });
                                                            setNewColorInput('');
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (newColorInput.trim() && !colors.includes(newColorInput.trim())) {
                                                        setColors([...colors, newColorInput.trim()]);
                                                        setColorStock({ ...colorStock, [newColorInput.trim()]: 0 });
                                                        setNewColorInput('');
                                                    }
                                                }}
                                                className='bg-pink-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/20'
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                            </button>
                                        </div>

                                        {colors.length > 0 && (
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-4'>
                                                {colors.map((c, i) => (
                                                    <div key={i} className='bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-3 shadow-sm'>
                                                        <div className='flex items-center justify-between'>
                                                            <span className='font-bold text-gray-700 dark:text-gray-300'>{c}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setColors(colors.filter(color => color !== c));
                                                                    const newColorStock = { ...colorStock };
                                                                    delete newColorStock[c];
                                                                    setColorStock(newColorStock);
                                                                    const newColorImages = { ...colorImages };
                                                                    delete newColorImages[c];
                                                                    setColorImages(newColorImages);
                                                                }}
                                                                className='text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-all'
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        </div>
                                                        <div className='flex items-center gap-4'>
                                                            <label htmlFor={`colorImage-${i}`} className='relative cursor-pointer group shrink-0'>
                                                                <div className='w-14 h-14 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-pink-500 transition-all'>
                                                                    <img className='w-full h-full object-cover' src={colorImages[c] ? URL.createObjectURL(colorImages[c]) : assets.upload_area} alt="Color variant" />
                                                                </div>
                                                                <input onChange={(e) => setColorImages({ ...colorImages, [c]: e.target.files[0] })} type="file" id={`colorImage-${i}`} hidden />
                                                            </label>
                                                            <div className='flex-1'>
                                                                <label className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block'>In Stock</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={Math.max(0, Number(stock || 0) - Object.entries(colorStock).reduce((sum, [col, val]) => col !== c ? sum + (Number(val) || 0) : sum, 0))}
                                                                    value={colorStock[c] !== undefined ? colorStock[c] : ''}
                                                                    onChange={(e) => {
                                                                        const val = Number(e.target.value);
                                                                        const maxAllowed = Math.max(0, Number(stock || 0) - Object.entries(colorStock).reduce((sum, [col, v]) => col !== c ? sum + (Number(v) || 0) : sum, 0));
                                                                        if (val > maxAllowed) {
                                                                            toast.warning(`Total stock limit reached (${maxAllowed} remaining)`);
                                                                            setColorStock({ ...colorStock, [c]: maxAllowed });
                                                                        } else {
                                                                            setColorStock({ ...colorStock, [c]: val });
                                                                        }
                                                                    }}
                                                                    className='w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-pink-500/30 focus:border-pink-500 transition-all text-sm'
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='flex justify-end pt-8 border-t border-gray-100 dark:border-gray-800'>
                            <button type="submit" className='w-full sm:w-fit px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300'>
                                Create Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default Add
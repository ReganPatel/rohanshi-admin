import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const List = ({ token }) => {
    const [list, setList] = useState([]);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '', description: '', price: '', originalPrice: '',
        category: '', subCategory: '', sizes: [], colors: [], colorStock: {}, sizeStock: {}, colorImages: {}, existingColorImage: {}, stock: '',
        gallery: []
    });
    const [newColorInput, setNewColorInput] = useState('');
    const [newSizeInput, setNewSizeInput] = useState('');
    const [hasSizes, setHasSizes] = useState(false);
    const [hasColors, setHasColors] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Filter State
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [subCategoryFilter, setSubCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out'

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(30);

    const fetchList = async () => {
        try {

            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setList(response.data.products);
            }
            else {
                toast.error(response.data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const removeProduct = async (id) => {
        try {

            const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                await fetchList();
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleEditClick = (product) => {
        setEditingProduct(product);
        // Combine existing images and an initial empty new images slot into a gallery
        const initialGallery = [
            ...(product.image || []).map(url => ({ type: 'existing', val: url })),
            { type: 'new', val: null }
        ];
        
        setEditForm({
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || '',
            category: product.category,
            subCategory: product.subCategory,
            sizes: product.sizes || [],
            colors: product.colors || [],
            colorStock: product.colorStock || {},
            sizeStock: product.sizeStock || {},
            colorImages: {},
            existingColorImage: product.colorImage || {},
            stock: product.stock,
            gallery: initialGallery
        });
        setHasSizes((product.sizes && product.sizes.length > 0) ? true : false);
        setHasColors((product.colors && product.colors.length > 0) ? true : false);
        setNewColorInput('');
        setNewSizeInput('');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("id", editingProduct._id);
            formData.append("name", editForm.name);
            formData.append("description", editForm.description);
            formData.append("price", editForm.price);
            formData.append("originalPrice", editForm.originalPrice);
            formData.append("category", editForm.category);
            formData.append("subCategory", editForm.subCategory);
            formData.append("stock", editForm.stock);
            if (Number(editForm.stock) < 0) {
                toast.error("Total stock cannot be negative");
                return;
            }

            if (hasColors) {
                for (const color in editForm.colorStock) {
                    if (Number(editForm.colorStock[color]) < 0) {
                        toast.error(`Stock for color ${color} cannot be negative`);
                        return;
                    }
                }
            }

            if (hasSizes) {
                for (const size in editForm.sizeStock) {
                    if (Number(editForm.sizeStock[size]) < 0) {
                        toast.error(`Stock for size ${size} cannot be negative`);
                        return;
                    }
                }
            }

            formData.append("sizes", JSON.stringify(hasSizes ? editForm.sizes : []));
            formData.append("colors", JSON.stringify(hasColors ? editForm.colors : []));
            formData.append("colorStock", JSON.stringify(hasColors ? editForm.colorStock : {}));
            formData.append("sizeStock", JSON.stringify(hasSizes ? editForm.sizeStock : {}));
            // Prepare image ordering for backend
            const imagesOrder = [];
            const newFiles = [];
            
            editForm.gallery.forEach(item => {
                if (item.type === 'existing') {
                    imagesOrder.push(item.val);
                } else if (item.type === 'new' && item.val) {
                    imagesOrder.push(`new_file_${newFiles.length}`);
                    newFiles.push(item.val);
                }
            });

            formData.append("imagesOrder", JSON.stringify(imagesOrder));
            formData.append("existingImages", JSON.stringify(editForm.gallery.filter(i => i.type === 'existing').map(i => i.val)));
            formData.append("existingColorImage", JSON.stringify(hasColors ? editForm.existingColorImage : {}));
            formData.append("isColorImagesOnly", "false");

            newFiles.forEach((img) => {
                formData.append("images", img);
            });

            let nextIndex = newFiles.length;

            const colorImageIndices = {};
            if (hasColors) {
                for (const color of editForm.colors) {
                    if (editForm.colorImages && editForm.colorImages[color]) {
                        formData.append("images", editForm.colorImages[color]);
                        colorImageIndices[color] = nextIndex;
                        nextIndex++;
                    }
                }
            }
            formData.append("colorImageIndices", JSON.stringify(hasColors ? colorImageIndices : {}));
            
            // If primary images haven't changed, we might need to send the existing URLs 
            // but the backend updateProduct currently replaces it with imagesUrl (newly uploaded)
            // if isColorImagesOnly is false. 
            // To keep existing images, we'd need to modify the backend or pass URLs differently.
            // For now, let's assume the user is uploading new images if they use this.

            const response = await axios.post(backendUrl + '/api/product/update', formData, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                setIsEditModalOpen(false);
                setEditingProduct(null);
                await fetchList();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

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
            // Remove the empty placeholder if it exists at the end
            const currentGallery = editForm.gallery.filter(item => item.type !== 'new' || item.val !== null);
            const newEntries = droppedFiles.map(file => ({ type: 'new', val: file }));
            const combined = [...currentGallery, ...newEntries];
            if (combined.length < 10) {
                combined.push({ type: 'new', val: null });
            }
            setEditForm(prev => ({ 
                ...prev, 
                gallery: combined
            }));
        }
    };

    useEffect(() => {
        fetchList()
    }, [])

    // Filtering Logic
    const filteredList = list.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
        const matchesSubCategory = subCategoryFilter === '' || item.subCategory === subCategoryFilter;
        
        let matchesStock = true;
        if (stockFilter === 'low') matchesStock = item.stock > 0 && item.stock < 5;
        else if (stockFilter === 'out') matchesStock = item.stock <= 0;

        return matchesSearch && matchesCategory && matchesSubCategory && matchesStock;
    });

    // Pagination Logic
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredList.length / itemsPerPage);
    const paginatedList = itemsPerPage === 'all' ? filteredList : filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filters change
    }, [search, categoryFilter, subCategoryFilter, stockFilter, itemsPerPage]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setIsEditModalOpen(false);
            }
        };
        if (isEditModalOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isEditModalOpen]);

    return (
        <>
        <div className="max-w-6xl mx-auto px-1 sm:px-4 pb-20 sm:pb-32">
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-2xl sm:text-3xl font-black text-gray-800 dark:text-white mb-2'>All Products</h1>
                    <p className='text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]'>Managing {list.length} products total</p>
                </div>
            </div>

            <div className='glass-effect rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden'>
                {/* --------- Filter Bar --------- */}
                <div className='p-4 sm:p-6 border-b border-white/10 dark:border-gray-700/50 flex flex-col lg:flex-row gap-4 items-center justify-between'>
                    <div className="w-full lg:flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="Quick search products..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:font-normal"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full lg:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="flex-1 sm:flex-none px-3 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 outline-none dark:text-white cursor-pointer"
                            >
                                <option value="">Category</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Kids">Kids</option>
                            </select>

                            <select 
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className={`flex-1 sm:flex-none px-3 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer transition-colors ${
                                    stockFilter === 'all' ? 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 dark:text-gray-300' : 
                                    stockFilter === 'low' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 text-orange-600' : 
                                    'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-600'
                                }`}
                            >
                                <option value="all">Stock: All</option>
                                <option value="low">Stock: Low</option>
                                <option value="out">Stock: Out</option>
                            </select>
                        </div>

                        {(search || categoryFilter || subCategoryFilter || stockFilter !== 'all') && (
                            <button 
                                onClick={() => {setSearch(''); setCategoryFilter(''); setSubCategoryFilter(''); setStockFilter('all')}}
                                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold transition-all"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* --------- List Table Title --------- */}
                <div className="overflow-x-auto no-scrollbar">
                    <div className='min-w-[800px] hidden md:grid grid-cols-[0.8fr_3fr_1.2fr_1fr_0.8fr_1fr] items-center py-5 px-8 bg-gray-50/50 dark:bg-slate-900/50 border-b border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]'>
                        <span>Media</span>
                        <span>Product Detail</span>
                        <span>Category</span>
                        <span>Base Price</span>
                        <span>Stock</span>
                        <span className='text-center'>Actions</span>
                    </div>

                    {/*------- Product List --------*/}
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 w-full">
                        {
                            paginatedList.length > 0 ? (
                                paginatedList.map((item, index) => (
                                    <div className='flex flex-col sm:grid sm:grid-cols-[0.8fr_3fr_1.2fr_1fr_0.8fr_1fr] items-start sm:items-center gap-4 py-5 px-4 sm:px-8 text-sm dark:bg-gray-800/50 dark:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200' key={index}>
                                        <div className="relative group shrink-0 w-full sm:w-auto">
                                            <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-lg">
                                                <img className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' src={item.image[0]} alt="" />
                                            </div>
                                            {item.stock < 5 && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="min-w-0 w-full sm:w-auto">
                                            <p className="font-extrabold text-gray-900 dark:text-white text-base sm:text-sm truncate mb-1">{item.name}</p>
                                            <div className="md:hidden flex flex-wrap items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{item.category}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>Stock: {item.stock}</span>
                                                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 ml-auto">{currency}{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="hidden md:block">
                                            <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/30">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="font-black text-gray-900 dark:text-white">{currency}{item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.stock <= 0 ? 'bg-red-500' : item.stock < 5 ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                                <p className={`text-[11px] font-bold ${item.stock < 5 ? 'text-red-500' : 'text-gray-500'}`}>{item.stock} unit</p>
                                            </div>
                                        </div>
                                        <div className='flex w-full sm:w-auto justify-between sm:justify-center gap-6 sm:gap-4 items-center sm:border-none border-t border-gray-100 dark:border-gray-700/50 pt-4 sm:pt-0'>
                                            <button onClick={() => handleEditClick(item)} className='text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1'>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Edit
                                            </button>
                                            <button onClick={() => removeProduct(item._id)} className='text-gray-400 hover:text-red-500 transition-all flex items-center gap-1 text-[11px] font-black uppercase tracking-widest' title="Delete Product">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span className="sm:hidden">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <p className="text-gray-400 dark:text-gray-500 font-medium">No products match your filters</p>
                                    <button onClick={() => {setSearch(''); setCategoryFilter(''); setSubCategoryFilter(''); setStockFilter('all')}} className="mt-2 text-indigo-500 font-bold text-sm hover:underline">Reset all filters</button>
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* --------- Pagination UI --------- */}
                {filteredList.length > 0 && (
                    <div className='p-4 bg-gray-50/30 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4'>
                        <div className='flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400'>
                            <span>Show</span>
                            <select 
                                value={itemsPerPage} 
                                onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 outline-none'
                            >
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="all">All</option>
                            </select>
                            <span>of {filteredList.length} items</span>
                        </div>

                        {itemsPerPage !== 'all' && totalPages > 1 && (
                            <div className='flex items-center gap-1'>
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
                                >
                                    Prev
                                </button>
                                
                                <div className='flex items-center gap-1 px-4 text-xs font-bold text-gray-600 dark:text-gray-400'>
                                    Page <span className='text-indigo-600 dark:text-indigo-400 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md mx-1'>{currentPage}</span> of {totalPages}
                                </div>

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

            {/* Edit Modal Overhaul */}
            {isEditModalOpen && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center p-0 xs:p-2 sm:p-4 backdrop-blur-xl bg-black/60'>
                    <div className='bg-white dark:bg-gray-900 sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col relative border border-white/20 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden'>
                        <button onClick={() => setIsEditModalOpen(false)} className='absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-indigo-600 dark:hover:text-white transition-all z-30 shadow-sm'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="p-8 sm:p-10 pb-6 shrink-0">
                            <h2 className='text-3xl font-black text-gray-800 dark:text-white'>Update Product</h2>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mt-2">Manage listing details & Variants</p>
                        </div>
                        <div className="flex-1 overflow-y-auto px-8 sm:px-10 pb-10 custom-scrollbar">
                            <form onSubmit={handleEditSubmit} className='flex flex-col gap-8'>
                            {/* Images Section Enhanced */}
                            <div>
                                <p className='text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-4 px-1'>Gallery Management</p>
                                <div 
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`flex gap-3 flex-wrap p-4 rounded-3xl border-2 border-dashed transition-all relative ${isDragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-100 dark:border-gray-800 bg-gray-50/30'}`}
                                >
                                    {isDragging && (
                                        <div className='absolute inset-0 flex items-center justify-center bg-indigo-500/10 backdrop-blur-[2px] z-10 rounded-3xl pointer-events-none'>
                                            <p className='text-indigo-600 dark:text-indigo-400 font-black animate-bounce'>Release to add</p>
                                        </div>
                                    )}
                                    {editForm.gallery.map((item, index) => (
                                        <div key={index} className='relative group shrink-0'>
                                            <label htmlFor={item.type === 'new' ? `edit-new-img-${index}` : undefined} className={item.type === 'new' ? 'cursor-pointer block' : 'block'}>
                                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shadow-sm transition-all flex items-center justify-center ${index === 0 ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-white dark:border-gray-800 hover:border-indigo-400 bg-white dark:bg-gray-800'}`}>
                                                    {item.val ? (
                                                        <img className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' src={item.type === 'existing' ? item.val : URL.createObjectURL(item.val)} alt="" />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                {item.type === 'new' && (
                                                    <input onChange={(e) => {
                                                        const newFiles = Array.from(e.target.files);
                                                        if (newFiles.length > 0) {
                                                            const currentGallery = editForm.gallery.filter((i, idx) => (i.type !== 'new' || i.val !== null) && idx !== index);
                                                            const newEntries = newFiles.map(file => ({ type: 'new', val: file }));
                                                            const combined = [...currentGallery, ...newEntries];
                                                            if (combined.length < 10 && (combined.length === 0 || combined[combined.length - 1].val !== null)) {
                                                                combined.push({ type: 'new', val: null });
                                                            }
                                                            setEditForm(prev => ({ ...prev, gallery: combined }));
                                                        }
                                                    }} type="file" id={`edit-new-img-${index}`} hidden multiple />
                                                )}
                                            </label>
                                            
                                            {item.val && (
                                                <>
                                                    <div className="absolute bottom-1.5 left-1.5">
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const newGallery = [...editForm.gallery];
                                                                const [selected] = newGallery.splice(index, 1);
                                                                newGallery.unshift(selected);
                                                                setEditForm(prev => ({ ...prev, gallery: newGallery }));
                                                            }}
                                                            className={`px-1.5 py-1 rounded-[6px] text-[7px] font-black uppercase tracking-tighter transition-all shadow-xl ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-white/95 dark:bg-black/90 text-gray-800 dark:text-gray-200 hover:bg-white'}`}
                                                        >
                                                            {index === 0 ? 'Main' : 'Promote'}
                                                        </button>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            const newGallery = editForm.gallery.filter((_, i) => i !== index);
                                                            if (newGallery.length === 0 || newGallery[newGallery.length - 1].val !== null) {
                                                                newGallery.push({ type: 'new', val: null });
                                                            }
                                                            setEditForm(prev => ({ ...prev, gallery: newGallery }));
                                                        }} 
                                                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-xl hover:bg-red-600 z-20 hover:-translate-y-0.5 active:translate-y-0'
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className='space-y-4'>
                                <div className='grid grid-cols-1 gap-4'>
                                    <div>
                                        <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 px-1'>Product Name</p>
                                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white focus:border-indigo-500 outline-none transition-all text-sm font-bold' placeholder="Product Name" required />
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 px-1'>Description</p>
                                        <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white focus:border-indigo-500 outline-none transition-all text-sm font-medium min-h-[80px]' placeholder="Product Details..." required />
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 px-1'>Old Price</p>
                                            <input type="number" value={editForm.originalPrice} onChange={e => setEditForm({ ...editForm, originalPrice: e.target.value })} className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white focus:border-indigo-500 outline-none transition-all text-sm font-bold' placeholder="Original" />
                                        </div>
                                        <div>
                                            <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 px-1'>Sale Price</p>
                                            <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className='w-full px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 outline-none transition-all text-sm font-black' placeholder="Price" required />
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 px-1'>Total Stock</p>
                                        <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white focus:border-indigo-500 outline-none transition-all text-sm font-bold' required min="0" />
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 px-1'>Category</p>
                                        <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white focus:border-indigo-500 outline-none transition-all text-xs font-bold appearance-none bg-no-repeat bg-[right_1rem_center]'>
                                            <option value="Men">Men</option>
                                            <option value="Women">Women</option>
                                            <option value="Kids">Kids</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 px-1'>Sub Category</p>
                                        <select value={editForm.subCategory} onChange={e => setEditForm({ ...editForm, subCategory: e.target.value })} className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white focus:border-indigo-500 outline-none transition-all text-xs font-bold appearance-none bg-no-repeat bg-[right_1rem_center]'>
                                            {["Anklets", "Bangles", "Bracelets", "Brooches", "Earrings", "Hair accessories", "Necklaces", "Nose Rings", "Rings", "Toe Rings"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Variants - More Compressed */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className='p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <input onChange={() => setHasSizes(!hasSizes)} checked={hasSizes} type="checkbox" id='hasSizes' className='w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500' />
                                        <label className='font-black text-[10px] uppercase tracking-widest text-gray-500' htmlFor="hasSizes">Enable Sizes</label>
                                    </div>
                                    {hasSizes && (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input value={newSizeInput} onChange={(e) => setNewSizeInput(e.target.value)} className='flex-1 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-xs font-bold outline-none' placeholder='e.g. S, M, L' onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSizeInput.trim() && !editForm.sizes.includes(newSizeInput.trim()) && (setEditForm(p => ({...p, sizes: [...p.sizes, newSizeInput.trim()], sizeStock: {...p.sizeStock, [newSizeInput.trim()]: 0}})), setNewSizeInput('')))} />
                                                <button type="button" onClick={() => {
                                                    if (newSizeInput.trim() && !editForm.sizes.includes(newSizeInput.trim())) {
                                                        const trimmedSize = newSizeInput.trim();
                                                        setEditForm({ 
                                                            ...editForm, 
                                                            sizes: [...editForm.sizes, trimmedSize],
                                                            sizeStock: { ...editForm.sizeStock, [trimmedSize]: 0 }
                                                        });
                                                        setNewSizeInput('');
                                                    }
                                                }} className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-7 h-7 rounded-lg font-bold'>+</button>
                                            </div>
                                            <div className='max-h-32 overflow-y-auto space-y-2 pr-1'>
                                                {editForm.sizes.map((s, i) => (
                                                    <div key={i} className='flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-50 dark:border-gray-800'>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[9px] font-black truncate">{s}</p>
                                                            <input type="number" min="0" value={editForm.sizeStock[s] || 0} onChange={(e) => setEditForm(p => ({...p, sizeStock: {...p.sizeStock, [s]: Number(e.target.value)}}))} className='w-full bg-transparent text-[10px] font-bold outline-none text-indigo-500' placeholder="0" />
                                                        </div>
                                                        <button type="button" onClick={() => setEditForm(p => { const st = {...p.sizeStock}; delete st[s]; return {...p, sizes: p.sizes.filter(x => x !== s), sizeStock: st}})} className='text-red-300 hover:text-red-500 transition-colors'>
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <input onChange={() => setHasColors(!hasColors)} checked={hasColors} type="checkbox" id='hasColors' className='w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500' />
                                        <label className='font-black text-[10px] uppercase tracking-widest text-gray-500' htmlFor="hasColors">Enable Colors</label>
                                    </div>
                                    {hasColors && (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input value={newColorInput} onChange={(e) => setNewColorInput(e.target.value)} className='flex-1 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-xs font-bold outline-none' placeholder='e.g. Silver' onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newColorInput.trim() && !editForm.colors.includes(newColorInput.trim()) && (setEditForm(p => ({...p, colors: [...p.colors, newColorInput.trim()], colorStock: {...p.colorStock, [newColorInput.trim()]: 0}})), setNewColorInput('')))} />
                                                <button type="button" onClick={() => newColorInput.trim() && !editForm.colors.includes(newColorInput.trim()) && (setEditForm(p => ({...p, colors: [...p.colors, newColorInput.trim()], colorStock: {...p.colorStock, [newColorInput.trim()]: 0}})), setNewColorInput(''))} className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-7 h-7 rounded-lg font-bold'>+</button>
                                            </div>
                                            <div className='max-h-32 overflow-y-auto space-y-2 pr-1'>
                                                {editForm.colors.map((c, i) => (
                                                    <div key={i} className='flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-50 dark:border-gray-800'>
                                                        <label htmlFor={`editCol-${i}`} className='shrink-0 cursor-pointer'>
                                                            <img className='w-7 h-7 rounded-md object-cover border border-gray-100 dark:border-gray-700' src={editForm.colorImages[c] ? URL.createObjectURL(editForm.colorImages[c]) : (editForm.existingColorImage[c] || assets.upload_area)} alt="" />
                                                            <input onChange={(e) => setEditForm(p => ({ ...p, colorImages: { ...p.colorImages, [c]: e.target.files[0] } }))} type="file" id={`editCol-${i}`} hidden />
                                                        </label>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[9px] font-black truncate">{c}</p>
                                                            <input type="number" value={editForm.colorStock[c] || 0} onChange={(e) => setEditForm(p => ({...p, colorStock: {...p.colorStock, [c]: Number(e.target.value)}}))} className='w-full bg-transparent text-[10px] font-bold outline-none text-indigo-500' placeholder="0" />
                                                        </div>
                                                        <button type="button" onClick={() => setEditForm(p => { const st = {...p.colorStock}; delete st[c]; return {...p, colors: p.colors.filter(x => x !== c), colorStock: st}})} className='text-red-300 hover:text-red-500 transition-colors'>
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className='w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 text-xs transition-all hover:-translate-y-1 active:scale-[0.98] mt-4'>Update Product</button>
                        </form>
                    </div>
                </div>
            </div>
            )}
        </>
    )
}

export default List
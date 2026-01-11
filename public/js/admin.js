/* public/js/admin.js */

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('role') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    const adminName = document.getElementById('admin-name');
    if (adminName && localStorage.getItem('username')) {
        adminName.innerText = localStorage.getItem('username');
    }

    fetchAdminProducts();
    loadOrders();
    fetchUsersCount(); // Fetch Users separate

    // ... (Image Preview & Forms logic remains same) ...
    const imgInput = document.getElementById('p-img-file');
    if (imgInput) imgInput.addEventListener('change', function () {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        if (this.files) Array.from(this.files).forEach(f => {
            const r = new FileReader();
            r.onload = e => {
                const i = document.createElement('img');
                i.src = e.target.result;
                i.className = 'w-16 h-16 object-cover rounded-lg border border-gray-200';
                preview.appendChild(i);
            };
            r.readAsDataURL(f);
        });
    });

    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    document.getElementById('edit-product-form').addEventListener('submit', handleEditSubmit);
});

// Fetch & Render Real Dashboard Stats
// Fetch & Render Real Dashboard Stats
// Fetch Users Count (New Simple Logic)
async function fetchUsersCount() {
    try {
        const res = await fetch('/api/auth/users');
        if (res.ok) {
            const users = await res.json();
            updateStat('stat-users', users.length);
        } else {
            console.error('Failed to fetch users');
            updateStat('stat-users', 0);
        }
    } catch (e) {
        console.error('Users fetch error', e);
        updateStat('stat-users', 0);
    }
}

function updateStat(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value;
        // Simple count-up animation could go here
    }
}

function renderCharts(chartData) {
    // Transform API data for ApexCharts
    // chartData is [{_id: "2023-01-01", revenue: 1000, count: 5}, ...]
    // We need to fill missing days for the last 7 days usually, but for now just map existing

    // Sort just in case
    chartData.sort((a, b) => a._id.localeCompare(b._id));

    const categories = chartData.map(d => d._id); // Dates
    const revenueData = chartData.map(d => d.revenue);
    const orderData = chartData.map(d => d.count);

    // --- Chart 1: Revenue (Area) ---
    const options1 = {
        chart: { type: 'area', height: 300, fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } },
        grid: { strokeDashArray: 5, borderColor: '#f1f1f1' },
        colors: ['#3C50E0'],
        xaxis: { categories: categories, axisBorder: { show: false }, axisTicks: { show: false } },
        tooltip: { y: { formatter: (val) => '฿' + val.toLocaleString() } },
        series: [{ name: 'Revenue', data: revenueData }]
    };

    // Destroy previous if exists (simplified by just clearing HTML or new instance)
    document.querySelector("#chartOne").innerHTML = "";
    new ApexCharts(document.querySelector("#chartOne"), options1).render();

    // --- Chart 2: Orders (Bar) ---
    const options2 = {
        chart: { type: 'bar', height: 300, fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
        grid: { strokeDashArray: 5, borderColor: '#f1f1f1' },
        colors: ['#80CAEE'],
        xaxis: { categories: categories, axisBorder: { show: false }, axisTicks: { show: false } },
        series: [{ name: 'Orders', data: orderData }]
    };

    document.querySelector("#chartTwo").innerHTML = "";
    new ApexCharts(document.querySelector("#chartTwo"), options2).render();
}

// ... (Rest of loadOrders, fetchAdminProducts, handleForm functions match previous verify) ...
async function loadOrders() {
    try {
        const res = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const orders = await res.json();

        // Update Stats Directly
        updateStat('stat-orders', orders ? orders.length : 0);

        const container = document.getElementById('order-list');

        if (!orders || orders.length === 0) {
            container.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-400 font-medium">No orders found.</td></tr>`;
            return;
        }

        container.innerHTML = orders.map(o => `
            <tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <td class="p-4 font-mono text-xs font-bold text-black">#${o._id.slice(-6).toUpperCase()}</td>
                <td class="p-4">
                    <div class="font-bold text-sm text-black">${o.customerName}</div>
                    <div class="text-[10px] text-gray-400 font-medium">${o.tel}</div>
                </td>
                <td class="p-4 font-bold text-sm text-black">${money(o.totalPrice)}</td>
                <td class="p-4">
                    <select onchange="updateOrderStatus('${o._id}', this.value)" class="py-1 px-3 rounded-full text-[10px] font-bold uppercase border-none outline-none cursor-pointer ${o.status === 'paid' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>Paid</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td class="p-4">
                    ${o.slipImage ? `<a href="${o.slipImage}" target="_blank" class="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> View Slip</a>` : '<span class="text-gray-300 text-[10px] italic">No Slip</span>'}
                </td>
                <td class="p-4"><button class="text-gray-400 hover:text-black transition" title="View Details"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg></button></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function updateOrderStatus(id, status) {
    try {
        await fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ status })
        });
        showToast('Status Updated');
        // loadOrders(); // Keep logic from valid file, just updated styling
        loadOrders();
    } catch (e) { showToast('Error', 'error'); }
}

window.allProductsCache = [];
async function fetchAdminProducts() { /* same as before, preserving logic */
    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        window.allProductsCache = products;

        // Update Stats Directly
        updateStat('stat-products', products.length);

        const container = document.getElementById('product-list');

        if (products.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-400">No products found.</td></tr>`;
            return;
        }

        container.innerHTML = products.map(p => {
            const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/60';

            return `
            <tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <td class="p-4 flex gap-4 items-center">
                    <img src="${img}" class="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-gray-50">
                    <div>
                        <div class="font-bold text-black text-sm">${p.name}</div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">${p.brand}</div>
                    </div>
                </td>
                <td class="p-4 text-xs font-bold uppercase text-gray-500">${p.category || '-'}</td>
                <td class="p-4 text-sm font-bold font-anton text-black text-base tracking-wide">${money(p.price)}</td>
                <td class="p-4">
                     <span class="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                        ${p.inStock ? 'In Stock' : 'Out of Stock'}
                     </span>
                </td>
                <td class="p-4">
                    <div class="flex gap-2">
                        <button onclick="openEditModal('${p._id}')" class="w-8 h-8 rounded flex items-center justify-center bg-gray-100 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                        <button onclick="deleteProduct('${p._id}')" class="w-8 h-8 rounded flex items-center justify-center bg-gray-100 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    } catch (e) { console.error(e); }
}

// ... handleAddProduct, openEditModal, handleEditSubmit, deleteProduct logic matches ...
// For brevity in this thought trace, I am reimplementing them exactly as they were in Step 171 but ensuring they are present.
// I'll include the full file content in the actual tool call to be safe.
async function handleAddProduct(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Creating...'; btn.disabled = true;

    const form = e.target;
    const formData = new FormData();
    formData.append('name', form.name.value);
    formData.append('brand', form.brand.value);
    formData.append('category', form.category.value);
    formData.append('price', form.price.value);
    formData.append('description', form.description.value);
    formData.append('sizes', form.sizes.value);
    formData.append('stock', form.stock.value);

    const fileInput = document.getElementById('p-img-file');
    for (let i = 0; i < fileInput.files.length; i++) formData.append('images', fileInput.files[i]);

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (res.ok) {
            showToast('Product Created Successfully!');
            form.reset();
            document.getElementById('image-preview').innerHTML = '';
            document.getElementById('add-product-modal').classList.remove('active');
            fetchAdminProducts();
        } else { showToast('Failed to create product', 'error'); }
    } catch (e) { showToast('Network Error', 'error'); }
    finally { btn.innerText = originalText; btn.disabled = false; }
}

function openEditModal(id) {
    const p = window.allProductsCache.find(x => x._id === id);
    if (!p) return;
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-brand').value = p.brand;
    document.getElementById('edit-category').value = p.category || 'other';
    document.getElementById('edit-price').value = p.price;
    document.getElementById('edit-description').value = p.description;
    document.getElementById('edit-sizes').value = p.sizes ? p.sizes.join(',') : '';
    document.getElementById('edit-stock').value = p.inStock ? 'true' : 'false';
    document.getElementById('edit-modal').classList.add('active');
}

async function handleEditSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('edit-name').value);
    formData.append('brand', document.getElementById('edit-brand').value);
    formData.append('category', document.getElementById('edit-category').value);
    formData.append('price', document.getElementById('edit-price').value);
    formData.append('description', document.getElementById('edit-description').value);
    formData.append('sizes', document.getElementById('edit-sizes').value);
    formData.append('stock', document.getElementById('edit-stock').value);

    const fileInput = document.getElementById('edit-img-file');
    for (let i = 0; i < fileInput.files.length; i++) formData.append('images', fileInput.files[i]);

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (res.ok) {
            showToast('Product Updated!');
            document.getElementById('edit-modal').classList.remove('active');
            fetchAdminProducts();
        }
    } catch (e) { showToast('Error', 'error'); }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) { showToast('Product Deleted'); fetchAdminProducts(); }
    } catch (e) { showToast('Error', 'error'); }
}
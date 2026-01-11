/* public/js/profile.js */

document.addEventListener('DOMContentLoaded', () => {
    loadUserOrders();
});

async function loadUserOrders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('order-list');
    const countEl = document.getElementById('total-orders-count');
    const spentEl = document.getElementById('total-spent-amount');

    try {
        const res = await fetch('/api/orders/my-orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch orders');

        const orders = await res.json();

        // Update Header Stats
        if (countEl) countEl.innerText = orders.length;
        if (spentEl) {
            const total = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalPrice : 0), 0);
            spentEl.innerText = money(total);
        }

        if (orders.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-gray-400 font-medium italic">
                <div class="mb-3">No orders found</div>
                <a href="index.html" class="inline-block px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition">Start Shopping</a>
            </td></tr>`;
            return;
        }

        container.innerHTML = orders.map(o => {
            const dateObj = new Date(o.createdAt);
            const date = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            // Status Badge
            let statusClass = 'bg-gray-100 text-gray-600';
            let statusIcon = '';

            if (o.status === 'paid') {
                statusClass = 'bg-green-50 text-green-700 border border-green-100';
                statusIcon = '✓';
            } else if (o.status === 'shipped') {
                statusClass = 'bg-blue-50 text-blue-700 border border-blue-100';
                statusIcon = '🚚';
            } else if (o.status === 'cancelled') {
                statusClass = 'bg-red-50 text-red-700 border border-red-100';
                statusIcon = '✕';
            } else if (o.status === 'pending') {
                statusClass = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
                statusIcon = '🕒';
            }

            return `
            <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition duration-200 group">
                <td class="p-5 font-mono text-xs font-bold text-gray-400 group-hover:text-black transition">#${o._id.slice(-6).toUpperCase()}</td>
                <td class="p-5">
                    <div class="text-xs font-bold text-gray-800">${date}</div>
                    <div class="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ${time}
                    </div>
                </td>
                <td class="p-5">
                    <div class="text-xs font-bold text-black">${o.items.length} Product${o.items.length > 1 ? 's' : ''}</div>
                    <div class="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">${o.items.map(i => i.name).join(', ')}</div>
                </td>
                <td class="p-5 text-sm font-bold font-anton text-black tracking-wide">${money(o.totalPrice)}</td>
                <td class="p-5">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClass}">
                        <span>${statusIcon}</span> ${o.status}
                    </span>
                </td>
            </tr>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        container.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-400 text-xs font-bold">Error loading history. Please try again.</td></tr>`;
    }
}
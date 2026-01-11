/* public/js/auth.js */
function checkAuthUI() {
    const token = localStorage.getItem('token');
    const authMenu = document.getElementById('auth-menu');
    const cartBadge = document.getElementById('cart-badge');

    // Cart Count
    if (cartBadge) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum, i) => sum + i.qty, 0);
        cartBadge.innerText = count;
        if (count === 0) cartBadge.classList.add('hidden');
        else cartBadge.classList.remove('hidden');
    }

    // Login/Logout Menu
    if (authMenu) {
        if (token) {
            authMenu.innerHTML = `
                <div class="flex items-center gap-6">
                    ${localStorage.getItem('role') === 'admin'
                    ? `<a href="admin.html" class="flex items-center gap-1 text-black bg-gray-100 hover:bg-black hover:text-white px-3 py-1 rounded-md transition-all duration-300 shadow-sm border border-gray-200">
                             <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                             ADMIN
                           </a>`
                    : `<span class="text-xs font-bold text-gray-500">WELCOME</span>`
                }
                    <button onclick="logout()" class="text-xs font-black text-red-600 hover:text-red-700 hover:underline tracking-widest">LOGOUT</button>
                </div>
            `;
        } else {
            authMenu.innerHTML = `
                <a href="login.html" class="flex items-center gap-2 hover:text-red-600 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                    LOGIN
                </a>`;
        }
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
const id = new URLSearchParams(location.search).get('id');
let currentProduct = null, selectedSize = null;
let currentRating = 0;

document.addEventListener('DOMContentLoaded', () => {
    checkAuthUI();
    fetchProduct();
});

function fetchProduct() {
    fetch(`${API_URL}/products`).then(r => r.json()).then(products => {
        currentProduct = products.find(p => p._id === id);
        if (currentProduct) {
            renderProductDetails();
            renderReviews();
        }
    });
}

function renderProductDetails() {
    // Images
    const images = (currentProduct.images && currentProduct.images.length > 0)
        ? currentProduct.images
        : [currentProduct.image || 'https://via.placeholder.com/500'];

    document.getElementById('pd-img').src = images[0];

    // Gallery
    document.getElementById('pd-gallery').innerHTML = images.map((img, idx) => `
        <div onclick="setMainImg('${img}', this)" 
             class="cursor-pointer border-2 ${idx === 0 ? 'border-black' : 'border-transparent'} hover:border-gray-300 transition bg-gray-50 aspect-square flex items-center justify-center p-2 rounded-sm">
            <img src="${img}" class="w-full h-full object-contain">
        </div>
    `).join('');

    // Text Info
    document.getElementById('pd-name').innerText = currentProduct.name;
    document.getElementById('pd-brand').innerText = currentProduct.brand || 'Premium';
    document.getElementById('pd-price').innerText = money(currentProduct.price);
    document.getElementById('pd-desc').innerText = currentProduct.description || '-';

    // Button State
    const btn = document.getElementById('add-btn');
    if (!currentProduct.inStock) {
        btn.disabled = true;
        btn.innerText = "SOLD OUT";
        btn.className = "w-full bg-gray-200 text-gray-400 py-5 font-bold uppercase cursor-not-allowed";
    } else {
        btn.onclick = () => addToCart(currentProduct, selectedSize);
    }

    // Sizes
    document.getElementById('pd-sizes').innerHTML = currentProduct.sizes.map(s =>
        `<button onclick="setSize(this,'${s}')" class="sz-btn border border-gray-200 py-4 font-bold text-sm hover:border-black transition">${s}</button>`
    ).join('');
}

function renderReviews() {
    const list = document.getElementById('reviews-list');
    const count = document.getElementById('review-count');
    const countTop = document.getElementById('review-count-top');

    // Updates
    if (currentProduct.reviews) {
        const len = currentProduct.reviews.length;
        if (count) count.innerText = len;
        if (countTop) countTop.innerText = len;

        if (len > 0) {
            list.innerHTML = currentProduct.reviews.slice().reverse().map(r => `
                <div class="border-b border-gray-50 pb-6 last:border-0">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                                ${r.user.substring(0, 2)}
                            </div>
                            <span class="text-sm font-bold text-black">${r.user}</span>
                        </div>
                        <span class="text-[10px] text-gray-400 font-medium">${new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <div class="flex items-center mb-2 text-yellow-500 text-xs">
                        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                    </div>
                    <p class="text-sm text-gray-600 leading-relaxed">${r.comment}</p>
                </div>
            `).join('');
        }
    }
}

// Interactivity
window.setMainImg = (src, el) => {
    document.getElementById('pd-img').src = src;
    document.querySelectorAll('#pd-gallery > div').forEach(d => {
        d.classList.remove('border-black'); d.classList.add('border-transparent');
    });
    el.classList.remove('border-transparent'); el.classList.add('border-black');
};

window.setSize = (btn, size) => {
    document.querySelectorAll('.sz-btn').forEach(b => {
        b.classList.remove('bg-black', 'text-white');
        b.classList.add('border-gray-200', 'text-black');
    });
    btn.classList.remove('border-gray-200', 'text-black');
    btn.classList.add('bg-black', 'text-white');
    selectedSize = size;
};

// Review Logic
window.setRating = (rating) => {
    currentRating = rating;
    const stars = document.getElementById('star-rating').children;
    for (let i = 0; i < 5; i++) {
        if (i < rating) stars[i].classList.replace('text-gray-300', 'text-yellow-400');
        else stars[i].classList.replace('text-yellow-400', 'text-gray-300');
    }
};

window.submitReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please login to review', 'error');
        window.location.href = 'login.html';
        return;
    }

    const comment = document.getElementById('review-comment').value;
    if (!currentRating || !comment) {
        showToast('Please provide a rating and comment', 'error');
        return;
    }

    const username = localStorage.getItem('username') || 'User';

    try {
        const res = await fetch(`${API_URL}/products/${id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user: username, rating: currentRating, comment })
        });

        if (res.ok) {
            showToast('Review submitted successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed to submit review', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error submitting review', 'error');
    }
};

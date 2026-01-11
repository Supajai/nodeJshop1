const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/prokicks_db')
    .then(async () => {
        console.log('Connected to MongoDB');

        const dummyProducts = [
            { name: 'Nike Air Zoom Alpha', brand: 'Nike', category: 'running', price: 4500, inStock: true, description: 'Premium running shoes.', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], sizes: ['40', '41', '42'] },
            { name: 'Adidas UltraBoost 22', brand: 'Adidas', category: 'running', price: 6500, inStock: true, description: 'Energy return capabilities.', images: ['https://images.unsplash.com/photo-1587563871167-1ee797455c1b?w=500'], sizes: ['40', '42', '44'] },
            { name: 'Puma Future Z', brand: 'Puma', category: 'football', price: 7200, inStock: true, description: 'Agility and control.', images: ['https://images.unsplash.com/photo-1511886929837-354d8276ee26?w=500'], sizes: ['41', '42', '43'] },
            { name: 'Mizuno Morelia Neo', brand: 'Mizuno', category: 'football', price: 8900, inStock: true, description: 'K-Leather barefoot feel.', images: ['https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500'], sizes: ['39', '40', '41'] },
            { name: 'Nike Mercurial Vapor', brand: 'Nike', category: 'football', price: 5400, inStock: true, description: 'Speed optimized.', images: ['https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=500'], sizes: ['40', '41', '42', '43'] },
            { name: 'Adidas Predator Edge', brand: 'Adidas', category: 'football', price: 8500, inStock: false, description: 'Swerve and control.', images: ['https://images.unsplash.com/photo-1518002171953-a080ee802e12?w=500'], sizes: ['42', '43'] },
            { name: 'Nike Dunk Low Panda', brand: 'Nike', category: 'sneaker', price: 3900, inStock: true, description: 'Classic street style.', images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500'], sizes: ['36', '37', '38', '40'] },
            { name: 'Jordan 1 High OG', brand: 'Nike', category: 'basketball', price: 12000, inStock: true, description: 'The icon.', images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500'], sizes: ['42', '43', '44', '45'] },
            { name: 'Nike Tiempo Legend', brand: 'Nike', category: 'football', price: 4700, inStock: true, description: 'Classic touch.', images: ['https://images.unsplash.com/photo-1562183241-b937e95585b6?w=500'], sizes: ['40', '42'] },
            { name: 'Adidas Samba OG', brand: 'Adidas', category: 'sneaker', price: 3200, inStock: true, description: 'Street icon.', images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'], sizes: ['38', '39', '40'] },
            { name: 'Puma LaMelo Ball MB.01', brand: 'Puma', category: 'basketball', price: 6800, inStock: true, description: 'Not from here.', images: ['https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=500'], sizes: ['41', '42', '43'] }
        ];

        await Product.insertMany(dummyProducts);
        console.log('Seeded 11 products!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

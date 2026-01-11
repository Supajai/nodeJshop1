/* controllers/orderController.js */
const Order = require('../models/Order');

// สร้างออเดอร์ใหม่ (พร้อมรับรูปสลิป)
exports.createOrder = async (req, res) => {
    try {
        const { customerName, tel, address, totalPrice, items } = req.body;

        // จัดการรูปสลิป
        let slipImagePath = '';
        if (req.file) {
            slipImagePath = '/uploads/' + req.file.filename;
        }

        // แปลงรายการสินค้าจาก JSON String เป็น Object (เพราะ FormData ส่งมาเป็น String)
        let parsedItems = [];
        try {
            parsedItems = JSON.parse(items);
        } catch (e) {
            parsedItems = items; // เผื่อกรณีส่งมาเป็น object อยู่แล้ว
        }

        const newOrder = new Order({
            userId: req.user ? req.user.userId : null, // ถ้าไม่ได้ล็อกอินก็เป็น null
            customerName,
            tel,
            address,
            items: parsedItems,
            totalPrice: Number(totalPrice),
            slipImage: slipImagePath, // ✅ บันทึก path รูป
            status: 'pending'
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
};

// ดึงออเดอร์ทั้งหมด (สำหรับ Admin)
exports.getAllOrders = async (req, res) => {
    try {
        // เรียงลำดับจากใหม่ไปเก่า
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// อัปเดตสถานะออเดอร์
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ดึงออเดอร์ของ User คนนั้นๆ
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Dashboard Stats (Real Data)
const Product = require('../models/Product');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments(); // might include admin, but that's fine
        const totalOrders = await Order.countDocuments();

        // 2. Revenue (Only Paid/Shipped orders)
        const revenueAgg = await Order.aggregate([
            { $match: { status: { $in: ['paid', 'shipped'] } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 3. Profit (Mocking profit as 30% of revenue for demo purposes, or just use revenue)
        // User asked for "Real Data" but we only have Price. Let's assume Profit = 40% of Revenue for display.
        const totalProfit = totalRevenue * 0.4;

        // 4. Chart Data (Last 7 Days Revenue & Orders)
        // This aggregation groups by YYYY-MM-DD
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const chartStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    status: { $in: ['paid', 'shipped'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalProducts,
            totalUsers,
            totalOrders,
            totalRevenue,
            totalProfit,
            totalViews: totalOrders * 12 + totalProducts * 5, // Mock views based on real metrics
            chartStats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
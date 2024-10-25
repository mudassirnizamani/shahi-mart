require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const http = require('http');
const { connectToDB } = require('./database/db');
const socketServer = require('./Socket/socket.js');

// Routes
const authRoutes = require('./routes/Auth');
const productRoutes = require('./routes/Product');
const orderRoutes = require('./routes/Order');
const cartRoutes = require('./routes/Cart');
const brandRoutes = require('./routes/Brand');
const categoryRoutes = require('./routes/Category');
const userRoutes = require('./routes/User');
const addressRoutes = require('./routes/Address');
const reviewRoutes = require('./routes/Review');
const wishlistRoutes = require('./routes/Wishlist');
const chatRoutes = require('./routes/chatBot');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ 
    origin: process.env.ORIGIN, 
    credentials: true, 
    exposedHeaders: ['X-Total-Count'], 
    methods: ['GET', 'POST', 'PATCH', 'DELETE'] 
  }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('tiny'));

// Connect to MongoDB
connectToDB();  // Make sure this function is called

// Route Middleware
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/cart', cartRoutes);
app.use('/brands', brandRoutes);
app.use('/categories', categoryRoutes);
app.use('/address', addressRoutes);
app.use('/reviews', reviewRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);

// WebSocket setup
socketServer(server);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'running' });
});

// Start server
server.listen(8000, () => {
  console.log('app [STARTED] ~ http://localhost:8000');
});

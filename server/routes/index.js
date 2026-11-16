import { Router } from 'express';
import multer from 'multer';
import authUser from '../middleware/authUser.js';
import authSeller from '../middleware/authSeller.js';
import * as user from '../controllers/userController.js';
import * as seller from '../controllers/sellerController.js';
import * as product from '../controllers/productController.js';
import * as cart from '../controllers/cartController.js';
import * as address from '../controllers/addressController.js';
import * as order from '../controllers/orderController.js';
import * as marketing from '../controllers/marketingController.js';

// Vercel limits request bodies to ~4.5 MB, so the seller UI compresses images before upload.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

const r = Router();

r.post('/user/register', user.register);
r.post('/user/login', user.login);
r.get('/user/is-auth', user.isAuth);
r.get('/user/logout', user.logout);

r.post('/seller/login', seller.sellerLogin);
r.get('/seller/is-auth', seller.sellerIsAuth);
r.get('/seller/logout', seller.sellerLogout);

r.get('/product/list', product.productList);
r.get('/product/:id', product.productById);
r.post('/product/add', authSeller, upload.array('images', 4), product.addProduct);
r.post('/product/stock', authSeller, product.changeStock);
r.post('/product/delete', authSeller, product.deleteProduct);
r.post('/product/seed-demo', authSeller, product.seedDemo);

r.post('/cart/update', authUser, cart.updateCart);

r.post('/address/add', authUser, address.addAddress);
r.get('/address/get', authUser, address.getAddresses);

r.post('/order/cod', authUser, order.placeOrderCOD);
r.get('/order/user', authUser, order.userOrders);
r.get('/order/seller', authSeller, order.sellerOrders);
r.post('/order/status', authSeller, order.updateOrderStatus);

r.post('/marketing/subscribe', marketing.subscribe);
r.post('/marketing/contact', marketing.contact);
r.get('/marketing/overview', authSeller, marketing.overview);
r.get('/marketing/subscribers.csv', authSeller, marketing.subscribersCsv);

export default r;

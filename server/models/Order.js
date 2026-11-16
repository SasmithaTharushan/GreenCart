import mongoose from 'mongoose';

export const ORDER_STATUSES = ['Order Placed', 'Packing', 'Out for delivery', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // Snapshot so past orders still display correctly if the product changes later.
    name: String,
    image: String,
    category: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'Order Placed' },
    paymentType: { type: String, enum: ['COD'], default: 'COD' },
    isPaid: { type: Boolean, default: false },
    source: { type: Object, default: {} }, // UTM / referrer attribution for marketing
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

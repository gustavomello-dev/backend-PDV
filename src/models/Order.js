import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    notes: { type: String, default: '' }
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ['CASH', 'CARD', 'PIX'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paidAt: { type: Date, default: Date.now },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
    status: {
      type: String,
      enum: ['OPEN', 'SENT', 'PREPARING', 'READY', 'DELIVERED', 'PAID', 'CANCELED'],
      default: 'OPEN'
    },
    payments: { type: [paymentSchema], default: [] },
    openedAt: { type: Date, default: Date.now },
    sentAt: Date,
    readyAt: Date,
    deliveredAt: Date,
    closedAt: Date
  },
  { timestamps: true }
);

orderSchema.virtual('total').get(function () {
  return Number(
    this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)
  );
});

orderSchema.virtual('paidAmount').get(function () {
  return Number(this.payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2));
});

orderSchema.virtual('remainingAmount').get(function () {
  return Number(Math.max(this.total - this.paidAmount, 0).toFixed(2));
});

orderSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Order', orderSchema);

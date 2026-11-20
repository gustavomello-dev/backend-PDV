import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Geral' },
    price: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);

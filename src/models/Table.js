import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true },
    seats: { type: Number, default: 4, min: 1 },
    status: {
      type: String,
      enum: ['FREE', 'OCCUPIED', 'RESERVED'],
      default: 'FREE'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Table', tableSchema);

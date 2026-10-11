import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'BarberProfile', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 800 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReviewSchema.index({ clientId: 1, barberId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);

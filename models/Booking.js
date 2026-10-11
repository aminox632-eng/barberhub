import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'BarberProfile', required: true, index: true },
    service: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    startMin: { type: Number, required: true },
    endMin: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    notes: { type: String, default: '', maxlength: 500 },
    // Set only while the booking is active. The sparse unique index makes the DB itself
    // reject two active bookings for the same barber/date/start time (race-condition safe).
    slotKey: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ slotKey: 1 }, { unique: true, sparse: true });
BookingSchema.index({ barberId: 1, date: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

import mongoose from 'mongoose';

const daySchema = { open: { type: String, default: '09:00' }, close: { type: String, default: '19:00' }, off: { type: Boolean, default: false } };
const defaultHours = () => ({
  mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: { off: true },
});

const BarberProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '', maxlength: 1500 },
    yearsExperience: { type: Number, default: 0 },
    cover: { type: String, default: '' },
    city: { type: String, required: true, trim: true, index: true },
    country: { type: String, required: true, trim: true, index: true },
    address: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    currency: { type: String, default: 'USD' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    skills: [String],
    services: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        duration: { type: Number, required: true, min: 10, default: 30 },
      },
    ],
    portfolio: [{ url: { type: String, default: '' }, category: { type: String, default: 'Other' } }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    workingHours: {
      mon: daySchema, tue: daySchema, wed: daySchema, thu: daySchema, fri: daySchema, sat: daySchema, sun: daySchema,
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BarberProfileSchema.pre('validate', function (next) {
  if (!this.workingHours || !this.workingHours.mon) this.workingHours = defaultHours();
  next();
});

export default mongoose.models.BarberProfile || mongoose.model('BarberProfile', BarberProfileSchema);

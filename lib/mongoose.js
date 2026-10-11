// Reuses the MongoClient exported by Vercel's lib/mongodb.js (atlas-blue-ball).
// No second connection is opened: Mongoose is simply bound to that client.
import mongoose from 'mongoose';
import clientPromise from './mongodb';

const state = global._barberhubMongoose || (global._barberhubMongoose = { promise: null });

export default async function dbConnect() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!state.promise) {
    state.promise = clientPromise
      .then((client) => {
        mongoose.connection.setClient(client);
        return mongoose;
      })
      .catch((err) => {
        state.promise = null;
        throw err;
      });
  }
  return state.promise;
}

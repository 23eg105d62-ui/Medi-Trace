import { Schema, model } from 'mongoose';

const PharmacySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: String,
    osmId: {
        type: String,
        unique: true,
        sparse: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    }
}, { timestamps: true });

PharmacySchema.index({ location: '2dsphere' });
export default model('Pharmacy', PharmacySchema);
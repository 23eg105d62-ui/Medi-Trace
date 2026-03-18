import { Schema, model } from 'mongoose';

const ReportSchema = new Schema({
    pharmacy: {
        type: Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    medicineName: {
        type: String,
        required: true
    },
    genericName: String,
    status: {
        type: String,
        enum: ['available', 'low', 'unavailable'],
        required: true
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    verifications: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}, { timestamps: true });

export default model('Report', ReportSchema);
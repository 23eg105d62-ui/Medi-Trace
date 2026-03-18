import mongoose from 'mongoose';
import Report from './Models/ReportModel.js';
import { config } from 'dotenv';

config();

const check = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        const count = await Report.countDocuments();
        console.log('Total reports in DB:', count);
        
        const sample = await Report.findOne().populate('pharmacy');
        console.log('Sample report:', {
            medicineName: sample?.medicineName,
            genericName: sample?.genericName,
            status: sample?.status,
            pharmacy: sample?.pharmacy?.name
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();

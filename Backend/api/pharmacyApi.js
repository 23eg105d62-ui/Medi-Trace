import express from 'express';
import Pharmacy from '../Models/PharmacyModel.js';
import Report from '../Models/ReportModel.js';

const pharmacyRoutes = express.Router();


pharmacyRoutes.get('/nearby', async (req, res) => {
    const { lng, lat, radius = 5000 } = req.query;
    const pharmacies = await Pharmacy.find({
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: [+lng, +lat] },
                $maxDistance: +radius
            }
        }
    }).limit(20);


    const enriched = await Promise.all(pharmacies.map(async (p) => {
        const reports = await Report.find({ pharmacy: p._id })
            .sort('-createdAt').limit(100);
        return { ...p.toObject(), reports };
    }));

    res.json(enriched);
});

pharmacyRoutes.get('/:id', async (req, res) => {
    const pharmacy = await Pharmacy.findById(req.params.id);
    res.json(pharmacy);
});

pharmacyRoutes.post('/seed', async (req, res) => {
    await Pharmacy.deleteMany({});
    const pharmacies = await Pharmacy.insertMany([
        {
            name: 'Apollo Pharmacy',
            address: 'Road No. 12, Banjara Hills, Hyderabad',
            location: { type: 'Point', coordinates: [78.4486, 17.4156] }
        },
        {
            name: 'MedPlus Pharmacy',
            address: 'Jubilee Hills, Hyderabad',
            location: { type: 'Point', coordinates: [78.4071, 17.4319] }
        },
        {
            name: 'Frank Ross Chemist',
            address: 'Panjagutta, Hyderabad',
            location: { type: 'Point', coordinates: [78.4483, 17.4259] }
        },
        {
            name: 'Wellness Forever',
            address: 'Madhapur, Hyderabad',
            location: { type: 'Point', coordinates: [78.3814, 17.4488] }
        }
    ]);
    res.status(201).json({ message: 'Seeded successfully', payload: pharmacies });
});
export default pharmacyRoutes;
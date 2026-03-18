import express from 'express';
import Report from '../Models/ReportModel.js';
import { protect } from '../Middlewares/auth.js';
import { io } from '../server.js';

const reportRoutes= express.Router();

const getAreaKey = (lng, lat) => {
    return `area_${parseFloat(lng).toFixed(1)}_${parseFloat(lat).toFixed(1)}`;
};

import Pharmacy from '../Models/PharmacyModel.js';

reportRoutes.get('/nearby', async (req, res) => {
    const { lat, lng, radius = 5000000 } = req.query;
    // Find pharmacies nearby that have reports, or just find all recent reports nearby
    const pharmacies = await Pharmacy.find({
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: [+lng, +lat] },
                $maxDistance: +radius
            }
        }
    }).select('_id osmId');

    const pharmacyIds = pharmacies.map(p => p._id);
    const reports = await Report.find({ pharmacy: { $in: pharmacyIds } })
        .populate('pharmacy')
        .sort('-createdAt')
        .limit(200);

    res.json(reports);
});

reportRoutes.post('/', async (req, res) => {
    const { pharmacyId, osmId, pharmacyData, medicineName, genericName, status, lng, lat } = req.body;

    let finalPharmacyId = pharmacyId;

    if (osmId) {
        let pharmacy = await Pharmacy.findOne({ osmId });
        if (!pharmacy && pharmacyData) {
            pharmacy = await Pharmacy.create({
                name: pharmacyData.name,
                address: pharmacyData.address,
                osmId: osmId,
                location: { type: 'Point', coordinates: pharmacyData.coordinates }
            });
        }
        if (pharmacy) finalPharmacyId = pharmacy._id;
    }

    if (!finalPharmacyId) {
        return res.status(400).json({ message: 'Pharmacy ID or OSM ID with data is required' });
    }

    const report = await Report.create({
        pharmacy: finalPharmacyId,
        medicineName,
        genericName,
        status,
        reportedBy: req.user?._id || null  
    });

    await report.populate('pharmacy');

    if (lng && lat) {
        const areaKey = getAreaKey(lng, lat);
        io.to(areaKey).emit('new-report', {
            report,
            message: `New report: ${medicineName} is ${status} at ${report.pharmacy.name}`
        });
    }

    res.status(201).json(report);
});

reportRoutes.post('/:id/verify', protect, async (req, res) => {
    const report = await Report.findById(req.params.id).populate('pharmacy');

    if (!report) {
        return res.status(404).json({ message: 'Report not found' });
    }

    if (report.verifications.includes(req.user._id)) {
        return res.status(400).json({ message: 'Already verified' });
    }

    report.verifications.push(req.user._id);
    await report.save();

    const { lng, lat } = req.body;
    if (lng && lat) {
        const areaKey = getAreaKey(lng, lat);
        io.to(areaKey).emit('report-verified', {
            reportId: report._id,
            verifications: report.verifications.length,
            medicineName: report.medicineName,
            pharmacyName: report.pharmacy.name
        });
    }

    res.json({ verifications: report.verifications.length });
});

export default reportRoutes;
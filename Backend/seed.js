import mongoose from 'mongoose';
import Pharmacy from './Models/PharmacyModel.js';
import Report from './Models/ReportModel.js';
import User from './Models/UserModel.js';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to DB for seeding...');

        
        await Pharmacy.deleteMany({});
        await Report.deleteMany({});
        await User.deleteMany({});

       
        const passwordHash = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: 'Sample User',
            email: 'user@example.com',
            passwordHash
        });
        console.log('User created');

        
        const pharms = await Pharmacy.insertMany([
            { name: 'Apollo Pharmacy', address: 'Road No. 12, Banjara Hills, Hyderabad', location: { type: 'Point', coordinates: [78.4486, 17.4156] } },
            { name: 'MedPlus Pharmacy', address: 'Jubilee Hills, Hyderabad', location: { type: 'Point', coordinates: [78.4071, 17.4319] } },
            { name: 'Frank Ross Chemist', address: 'Panjagutta, Hyderabad', location: { type: 'Point', coordinates: [78.4483, 17.4259] } },
            { name: 'Wellness Forever', address: 'Madhapur, Hyderabad', location: { type: 'Point', coordinates: [78.3814, 17.4488] } },
            { name: 'Thyrocare Pharmacy', address: 'Kondapur, Hyderabad', location: { type: 'Point', coordinates: [78.3585, 17.4622] } },
            { name: 'Hetero Drug Store', address: 'Hafeezpet, Hyderabad', location: { type: 'Point', coordinates: [78.3489, 17.4756] } },
            { name: 'Vijaya Medical', address: 'Ameerpet, Hyderabad', location: { type: 'Point', coordinates: [78.4385, 17.4374] } },
            { name: 'SureSafe Pharmacy', address: 'Lingampally, Hyderabad', location: { type: 'Point', coordinates: [78.3214, 17.4851] } }
        ]);
        console.log('Pharmacies seeded');

        const medsRaw = [
            ["Abecma", "Idecabtagene vicleucel"], ["Adakveo", "Crizanlizumab"], ["Alofisel", "Darvadstrocel"],
            ["Amondys 45", "Casimersen"], ["Amvuttra", "Vutrisiran sodium"], ["Andexxa", "Coagulation factor Xa"],
            ["Anthim", "Obiltoxaximab"], ["Asparlas", "Calaspargase pegol-mknl"], ["Ayvakit", "Avapritinib"],
            ["Besremi", "Ropeginterferon alfa-2b"], ["Blenrep", "Belantamab mafodotin"], ["Braftovi", "Encorafenib"],
            ["Breyanzi", "Lisocabtagene maraleucel"], ["Brukinsa", "Zanubrutinib"], ["Bylvay", "Odevixibat"],
            ["Cablivi", "Caplacizumab"], ["Camzyos", "Mavacamten"], ["Carvykti", "Ciltacabtagene autoleucel"],
            ["Copiktra", "Duvelisib"], ["Crysvita", "Burosumab"], ["Cytalux", "Pafolacianine sodium"],
            ["Danyelza", "Naxitamab-gqgk"], ["Daurismo", "Glasdegib"], ["Detectnet", "Copper Cu 64 dotatate"],
            ["Diacomit", "Stiripentol"], ["Dojolvi", "Triheptanoin"], ["Ebanga", "Ansuvimab-zykl"],
            ["Ebvallo", "Tabelecleucel"], ["Egaten", "Triclabendazole"], ["Elahere", "Mirvetuximab soravtansine"],
            ["Elzonris", "Tagraxofusp"], ["Empaveli", "Pegcetacoplan"], ["Enjaymo", "Sutimlimab"],
            ["Enspryng", "Satralizumab"], ["Epidiolex", "Cannabidiol"], ["Evkeeza", "Evinacumab"],
            ["Evrysdi", "Risdiplam"], ["Exkivity", "Mobocertinib succinate"], ["Firdapse", "Amifampridine"],
            ["Galafold", "Migalastat hydrochloride"], ["Gamifant", "Emapalumab-lzsg"], ["Gavreto", "Pralsetinib"],
            ["Givlaari", "Givosiran"], ["Hemlibra", "Emicizumab"], ["Imlygic", "Talimogene laherparepvec"],
            ["Inrebic", "Fedratinib"], ["Iressa", "Gefitinib"], ["Isturisa", "Osilodrostat"],
            ["Kalydeco", "Ivacaftor"], ["Kogenate", "Antihemophilic Factor"], ["Koselugo", "Selumetinib"],
            ["Kymriah", "Tisagenlecleucel"], ["Kyprolis", "Carfilzomib"], ["Lenvima", "Lenvatinib"],
            ["Libtayo", "Cemiplimab-rwlc"], ["Lorbrena", "Lorlatinib"], ["Lumoxiti", "Moxetumomab pasudotox"],
            ["Lutathera", "Lutetium Lu 177 dotatate"], ["Luxturna", "Voretigene neparvovec"], ["Mekinist", "Trametinib"],
            ["Mepsevii", "Vestronidase alfa-vjbk"], ["Naglazyme", "Galsulfase"], ["Nerlynx", "Neratinib"],
            ["Ninlaro", "Ixazomib"], ["Nplate", "Romiplostim"], ["Nucala", "Benralizumab"],
            ["Nuzyra", "Omadacycline"], ["Obizur", "Antihemophilic Factor"], ["Ocrevus", "Ocrelizumab"],
            ["Onpattro", "Patisiran"], ["Oxervate", "Cenegermin-bkbj"], ["Palynziq", "Pegvaliase-pqpz"],
            ["Panretin", "Alitretinoin"], ["Polivy", "Polatuzumab vedotin"], ["Poteligeo", "Mogamulizumab-kpkc"],
            ["Praxbind", "Idarucizumab"], ["Radicava", "Edaravone"], ["Retevmo", "Selpercatinib"],
            ["Revlimid", "Lenalidomide"], ["Rozlytrek", "Entrectinib"], ["Rubraca", "Rucaparib"],
            ["Scemblix", "Asciminib"], ["Soliris", "Eculizumab"], ["Spinraza", "Nusinersen"],
            ["Strensiq", "Asfotase alfa"], ["Sylvant", "Siltuximab"], ["Tabrecta", "Capmatinib"],
            ["Tafinlar", "Dabrafenib"], ["Tagrisso", "Osimertinib"], ["Tavalisse", "Fostamatinib"],
            ["Tegsedi", "Inotersen"], ["Tibsovo", "Ivosidenib"], ["Tukysa", "Tucatinib"],
            ["Turalio", "Pexidartinib"]
        ];

        const statuses = ['available', 'low', 'unavailable'];

        for (let i = 0; i < medsRaw.length; i++) {
            const [name, generic] = medsRaw[i];
            await Report.create({
                pharmacy: pharms[i % pharms.length]._id,
                medicineName: name,
                genericName: generic,
                status: statuses[i % 3],
                reportedBy: user._id,
                verifications: [user._id]
            });
        }
        console.log(`${medsRaw.length} Reports seeded`);

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();

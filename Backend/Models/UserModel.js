import {Schema,model} from 'mongoose';

const UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    passwordHash: String,
    reputationScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default model('User', UserSchema);
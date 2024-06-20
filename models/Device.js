const mongoose = require('mongoose');
const { Schema } = mongoose;

const deviceSchema = new Schema({
    device_name: { type: String, required: true },
    device_creation_time: { type: Date, required: true }
});

module.exports = mongoose.model('Device', deviceSchema);

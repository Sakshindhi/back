const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const deviceSchema = new Schema({
//     device_name: String,
//     device_creation_time: Date
// })

const spaceSchema = new mongoose.Schema({
    space_name: { type: String, required: true },
    space_creation_time: { type: Date, required: true },
    // devices: [deviceSchema]
});

const Space = mongoose.model('Space', spaceSchema);

module.exports = spaceSchema;

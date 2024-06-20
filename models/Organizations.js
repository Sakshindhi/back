// models/Organizations.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const spaceSchema = new Schema({
    space_name: String,
    space_creation_time: Date
});

const organizationSchema = new Schema({
    org_name: { type: String, required: true },
    description: { type: String, required: true },
    time_zone: { type: String, required: true },
    spaces: [spaceSchema]
});

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;

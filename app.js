const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Organization = require('./models/Organizations');
const Device = require('./models/Device');
const Space = require('./models/Spaces')

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/modelData')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    try {
        const response = await axios.post('https://sso.indhi.io/api/user', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        if (response.status === 200) {
            req.user = response.data;
            return next();
        } else {
            console.log('Token is invalid');
            return res.sendStatus(403);
        }
    } catch (error) {
        console.error('Error verifying token or fetching user details:', error.message);
        return res.sendStatus(500);
    }
};

// User --------------------------------------------------------------------------------------

app.get('/api/user', authenticateToken, (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).send(error);
        console.log(error.message);
    }
});

//Organizatons--------------------------------------------------------------------------------

app.post('/org', authenticateToken, async (req, res) => {
    const { org_name, description, time_zone } = req.body;
    if (!org_name || !description || !time_zone) {
        return res.status(400).json({
            error: 'The name of the organization, description, and the time zone are required fields.'
        });
    }

    const org = new Organization({ org_name, description, time_zone });

    try {
        await org.save();
        res.status(201).send(org);
    } catch (error) {
        res.status(400).send(error);
        console.log(error.message);
    }
});

app.get('/org', async (req, res) => {
    try {
        const organizations = await Organization.find();
        res.json({ organizations });
    } catch (error) {
        res.status(500).send(error);
        console.log(error.message);
    }
});

// Spaces ------------------------------------------------------------------------------------

app.post('/org/:organizationId/spaces', authenticateToken, async (req, res) => {
    const { organizationId } = req.params;
    const { space_name, space_creation_time } = req.body;

    if (!space_name || !space_creation_time) {
        return res.status(400).json({ error: 'space_name and space_creation_time are required fields.' });
    }

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        return res.status(400).json({ error: 'Invalid organization ID' });
    }

    try {
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        organization.spaces.push({ space_name, space_creation_time });
        await organization.save();

        res.status(201).send(organization);
    } catch (error) {
        res.status(400).send(error);
        console.log(error.message);
    }
});

app.get('/org/:organizationId/spaces', authenticateToken, async (req, res) => {
    const { organizationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        return res.status(400).json({ error: 'Invalid organization ID' });
    }

    try {
        const organization = await Organization.findById(organizationId).select('spaces');
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.json({ spaces: organization.spaces });
    } catch (error) {
        res.status(500).send(error);
        console.log(error.message);
    }
});

//Devices-------------------------------------------------------------------------------------

app.post('/device', authenticateToken, async (req, res) => {
    const { device_name , device_creation_time } = req.body;
    if (!device_name || device_creation_time) {
        return res.status(400).json({
            error: 'All fields are required are required fields.'
        });
    }

    const device = new Device({ device_name , device_creation_time });

    try {
        await device.save();
        res.status(201).send(device);
    } catch (error) {
        res.status(400).send(error);
        console.log(error.message);
    }
});

app.get('/device', async (req, res) => {
    try {
        const devices = await devices.find();
        res.json({ devices });
    } catch (error) {
        res.status(500).send(error);
        console.log(error.message);
    }
});

// app.post('/space/:spaceId/devices', authenticateToken, async (req, res) => {
//     const { spaceId } = req.params;
//     const { device_name, device_creation_time } = req.body;

//     if (!device_name || !device_creation_time) {
//         return res.status(400).json({ error: 'device_name and device_creation_time are required fields.' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(spaceId)) {
//         return res.status(400).json({ error: 'Invalid space ID' });
//     }

//     try {
//         const space = await space.findById(spaceId);
//         if (!space) {
//             return res.status(404).json({ error: 'space not found' });
//         }
//         space.devices.push({ device_name, device_creation_time });
//         await space.save();

//         res.status(201).send(space);
//     } catch (error) {
//         res.status(400).send(error);
//         console.log(error.message);
//     }
// });

// app.get('/space/:spaceId/devices', authenticateToken, async (req, res) => {
//     const { spaceId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(spaceId)) {
//         return res.status(400).json({ error: 'Invalid space ID' });
//     }

//     try {
//         const space = await space.findById(spaceId).select('device');
//         if (!space) {
//             return res.status(404).json({ error: 'space not found' });
//         }
//         res.json({ device: space.device });
//     } catch (error) {
//         res.status(500).send(error);
//         console.log(error.message);
//     }
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

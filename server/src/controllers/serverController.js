const ServerModel = require('../models/Server');
const Channel = require('../models/Channel');

// GET /api/servers
const getServers = async (req, res) => {
  try {
    const servers = await ServerModel.find({ 'members.user': req.user._id }).populate('owner', 'username avatar');
    res.json({ success: true, data: servers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/servers
const createServer = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Server name is required' });

    const server = await ServerModel.create({
      name, description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    // Tạo channel #general mặc định
    await Channel.create({ name: 'general', server: server._id });

    res.status(201).json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/servers/:id
const getServer = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members.user', 'username avatar');
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const isMember = server.members.some(m => m.user._id.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    res.json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/servers/join  { inviteCode }
const joinServer = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const server = await ServerModel.findOne({ inviteCode });
    if (!server) return res.status(404).json({ success: false, message: 'Invalid invite code' });

    const alreadyMember = server.members.some(m => m.user.equals(req.user._id));
    if (alreadyMember) return res.status(400).json({ success: false, message: 'Already a member' });

    server.members.push({ user: req.user._id, role: 'member' });
    await server.save();
    res.json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/servers/:id
const deleteServer = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    if (!server.owner.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Only owner can delete server' });

    await server.deleteOne();
    await Channel.deleteMany({ server: server._id });
    res.json({ success: true, message: 'Server deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getServers, createServer, getServer, joinServer, deleteServer };

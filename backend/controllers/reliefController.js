const ReliefRequest = require('../models/ReliefRequest');

// @desc  Create relief request
// @route POST /api/relief
// @access Private
exports.createRequest = async (req, res) => {
  const { requestType, description, location } = req.body;
  if (!requestType || !description || !location)
    return res.status(400).json({
      success: false,
      message: 'requestType, description and location are required',
    });

  try {
    const request = await ReliefRequest.create({
      ...req.body,
      requestedBy: req.user._id,
      status: 'pending',          // always starts as pending
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all relief requests
// @route GET /api/relief
// @access Private
exports.getRequests = async (req, res) => {
  try {
    // Regular users only see their own; admin/volunteer see all
    const filter = req.user.role === 'user' ? { requestedBy: req.user._id } : {};
    const { status, type, urgency } = req.query;
    if (status)  filter.status      = status;
    if (type)    filter.requestType = type;
    if (urgency) filter.urgency     = urgency;

    const requests = await ReliefRequest.find(filter)
      .populate('requestedBy',     'name email')
      .populate('assignedVolunteer','name email')
      .populate('disaster',         'title location')
      .sort('-createdAt');

    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single relief request
// @route GET /api/relief/:id
// @access Private
exports.getRequest = async (req, res) => {
  try {
    const request = await ReliefRequest.findById(req.params.id)
      .populate('requestedBy',     'name email')
      .populate('assignedVolunteer','name email')
      .populate('disaster',         'title location');

    if (!request)
      return res.status(404).json({ success: false, message: 'Request not found' });

    // Users can only view their own
    if (
      req.user.role === 'user' &&
      request.requestedBy._id.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update relief request (status + adminNote + assignedVolunteer)
// @route PUT /api/relief/:id
// @access Admin / Volunteer
exports.updateRequest = async (req, res) => {
  const allowed = ['status', 'adminNote', 'assignedVolunteer'];
  const update  = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  try {
    const request = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('requestedBy', 'name email')
     .populate('assignedVolunteer', 'name email');

    if (!request)
      return res.status(404).json({ success: false, message: 'Request not found' });

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete relief request
// @route DELETE /api/relief/:id
// @access Admin
exports.deleteRequest = async (req, res) => {
  try {
    const request = await ReliefRequest.findByIdAndDelete(req.params.id);
    if (!request)
      return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

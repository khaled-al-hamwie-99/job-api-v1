const { NotFoundError, BadRequestError } = require("../errors")
const Job = require("../models/Job")
const getAllJobs = async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user._id }).sort("createdAt")
    res.json(jobs)
}
const getJob = async (req, res) => {
    const { user: { _id: userId }, params: { id: jobId } } = req
    const job = await Job.findOne({
        _id: jobId, createdBy: userId
    })
    if (!job)
        throw new NotFoundError("no found with that id")
    res.json(job)
}
const createJob = async (req, res) => {
    const { position, company, status = "pending" } = req.body
    const job = await Job.create({ position, company, status, createdBy: req.user._id })
    res.status(201).json(job)
}
const updateJob = async (req, res) => {
    const { user: { _id: userId }, body: { company, status, position }, params: { id: jobId } } = req
    const validUpdate = ['company', 'status', 'position']
    const updates = Object.keys(req.body)
    if (company == "" || status == "" || position == "")
        throw new BadRequestError("u can't send an empty value")
    updates.forEach(update => {
        if (!validUpdate.includes(update))
            delete req.body[update]
    })
    const job = await Job.findByIdAndUpdate({
        _id: jobId, createdBy: userId
    }, req.body, {
        new: true,
        runValidators: true
    })
    if (!job)
        throw new NotFoundError("no found with that id")
    res.json(job)
}
const deleteJob = async (req, res) => {
    const { user: { _id: userId }, params: { id: jobId } } = req
    const job = await Job.findByIdAndDelete({
        _id: jobId, createdBy: userId
    })
    if (!job)
        throw new NotFoundError("no found with that id")
    res.json(job)
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
}
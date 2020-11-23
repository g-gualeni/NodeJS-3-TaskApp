const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

router = new express.Router()

router.post('/tasks', auth, async (req, res)=> {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()    
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get /tasks?completed=true
// Get /tasks?limit=10&skip=0
// Get /tasks?sortBy=createdAt:desc
// Get /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip:  parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send()        
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const owner = req.user._id
        const task = await Task.findOne({_id, owner})
        console.log(_id, task, owner)

        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)                
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    if(!isValid) {
        return res.status(400).send({ error: 'Invalid update operation'})    
    }
    
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task) {
            return res.status(404).send(req.params.id)
        }
        updates.forEach((update)=>task[update] = req.body[update])
        await task.save()
        return res.status(200).send(task)

    } catch (e) {
        return res.status(400).send()
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task) {
            return res.status(404).send({error: 'task not found'})
        }
        return res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})


module.exports = router
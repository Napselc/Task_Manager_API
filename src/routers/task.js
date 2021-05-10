const express = require("express")
const Task = require("../modules/task")
const router = new express.Router()
const auth = require("../middleware/auth")


// route to add a task

router.post("/tasks", auth, async (req,res) => {
    //const task = new Task(req.body)
    
    const task = new Task({
      ...req.body,
      owner: req.user._id
    })

    // task.save().then(() => {
    //   res.status(201).send(task)
    //     }).catch((e) => {
    //   res.status(400).send(e) 
    // })
  
    try {
      await task.save()
      res.status(201).send(task)
    }   catch(e){
      res.status(400).send(e)}
  
  })
  
  // route to fetch multiple tasks

  // GET /tasks?completed=true
  // GET /tasks?limit=2&skip=1
  // GET /tasks?sortBy=createdAt_asc
  
  router.get("/tasks", auth, async (req,res) => {
    // Task.find().then((tasks) => {
    //   res.status(200).send(tasks)
    // }).catch((e) => {
    //   res.status(500).send(e)
    // })
  const match= {}
  const sort = {}

   if(req.query.completed) {
     match.completed = req.query.completed === 'true'
   }

   if(req.query.sortBy) {
     const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

   
      try{

      await req.user.populate({
            path: 'tasks',
            match,
            options:{
              limit:parseInt(req.query.limit),
              skip:parseInt(req.query.skip),
              sort:sort
            }
        }).execPopulate()
       res.status(200).send(req.user.tasks)
    }   catch(e){
      res.status(500).send(e)
    }
  
  })
  
  // route to fetch a single task
  
  router.get("/tasks/:id", auth, async (req,res) => {
    
    const _id = req.params.id
    
    // Task.findById(_id).then((task) => {   
    //     if(!task){
    //       return res.status(400).send()
    //     }
        
    //     res.send(task)
   
    //    }).catch((e) => {
    //   res.status(500).send(e)
    // })
  
    try{
      const task = await Task.findOne({_id:_id, owner: req.user._id})
      if(!task){
        return res.status(400).send()
      }
      res.send(task)
  
    }   catch(e){
      res.status(500).send(e)
    }
  
  })
  
  // route to update a task
  
  router.patch("/tasks/:id", auth, async (req,res) => {
    
    const updateFields = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = updateFields.every((update) => {
        return allowedUpdates.includes(update)
    })
    
    if(!isValidOperation){
      return res.status(404).send({"error": "Invalid update"})
    }
  
    const _id = req.params.id
    const updates = req.body
    
      try{

        const task = await Task.find({_id, owner:req.user._id})
           

      // const task = await Task.findByIdAndUpdate(_id, updates, {new : true, runValidators:true} )
      if(!task){
        return res.status(404).send()
      }

       updateFields.forEach((updateField) => {
        task[updateField] = updates[updateField]
        })
        await task.save()
      res.send(task)
  
    }   catch(e){
      res.status(400).send(e)
    }
  
  })
  
  // route to delete a task
  
  router.delete("/tasks/:id", auth, async (req,res) => {
    
    const _id = req.params.id
    
     try{
      const task = await Task.findOneAndDelete({_id, owner:req.user._id})
      if(!task){
        return res.status(404).send()
      }
      res.send(task)
  
    }   catch(e){
      res.status(500).send(e)
    }
  
  })

  module.exports = router
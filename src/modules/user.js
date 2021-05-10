const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Task = require("./task")

const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim:true
    },
    age: {
        type: Number,
        default:0,
        validate(value) {
            if(value<0) {
                throw new Error("Age should be a positive no. !")
            }
        }
    },
    email :{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value) {
            if(!validator.isEmail(value)){
                    throw new Error("Invalid Email !")
            }
        }
    },

    password: {
        type: String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            
            if(value.toLowerCase().includes("password", "Password")){
                throw new Error("Password should not contain word password")
            }

        }
    },

    tokens: [{
        token: {
            type:String,
            required:true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// to generate public data

userSchema.methods.toJSON =  function() {   // methods  are accessible on the instanes also called instance methods

    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// to generate a user token

userSchema.methods.generateAuthToken = async function() {  

     const user = this
     const token = jwt.sign({"_id": user._id.toString()}, process.env.JWT_SECRET)

     user.tokens = user.tokens.concat({token})
     await user.save()
     return token
}


// to login a user 
userSchema.statics.findByCredentials = async (email, password) => { // statics are called on the model as called model methods
    const user = await User.findOne({"email":email})
    
    if(!user){
        throw new Error ("Unable to login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error ("Unable to login")
    }

    return user
}

//Hash the passowrd before saving
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete tasks of user when user deleted
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})


const User = mongoose.model("User", userSchema)

module.exports = User

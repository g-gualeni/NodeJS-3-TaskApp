const mongoose = require('mongoose')
const validator = require('validator')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const { json } = require('express')

const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type:String,
        unique: true,
        trim: true,
        required:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0) {
                throw new Error('Age must be above 18')
            }
        }

    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot be contained inside the passwored')
            }

        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],    
    avatar:{
        type: Buffer
    }
}, {
    timestamps:true
})

// Aggiungo una proprietà virtuale ovvero una relazione
// creo una relazione tra user e task
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Pulisce l'oggetto dalle proprietà che non serve mandare al client
// -> soluzione base, ma meglio fare override di to JSON
// userSchema.methods.getPublicProfile = function () {
//     const user = this
//     // toglie i pezzi aggiunti da mongoose
//     const userObject = user.toObject()
//     // Ora cancello gli attrìibuti che non voglio mandare al client
//     delete userObject.tokens
//     delete userObject.password
//     return userObject
// }

userSchema.methods.toJSON = function () {
    const user = this
    const jsonUser = user.toObject()
    delete jsonUser.password
    delete jsonUser.tokens
    delete jsonUser.avatar
    return jsonUser
}

// Metodo accessibile da una istanza della classe
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token
}

// Metodi statici della classe
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email}) 
    if(!user) {
        throw new Error('Unable to login')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        throw new Error('Unable to login')
    }
    return user
}

// Hash user pwd before save
userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
        // console.log('Just before saving', user.password)
    }
    next()  // Serve per uscire dal middleware
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
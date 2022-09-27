const joi = require('joi')

function userValidation(user){
    const userValidationSchema = joi.object({
        email: joi.string().email().trim().required(),
        password: joi.string().min(3).max(25).trim().required()
    })

    return userValidationSchema.validate(user)
}

module.exports = userValidation;


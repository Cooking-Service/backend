import prompts from 'prompts'

const questions = [{
    type: 'text',
    name: 'name',
    message: 'Enter name',
    validate: (name) => (name === '' ? 'field name is required' : true)
},
{
    type: 'text',
    name: 'lastName',
    message: 'Enter name',
    validate: (lastName) => (lastName === '' ? 'field LastName is required' : true)
},
{
    type: 'text',
    name: 'email',
    message: 'Enter email',
    validate: (email) => {
        if (email === '') {
            return 'field email is required'
        }

        if (!validateEmail(email)) {
            return 'enter a valid email account'
        }

        return true
    },

},
{
    type: 'password',
    name: 'password',
    validate: (password) => (password = '' ? 'field Password is required' : true)
}]


    (async () => {
        const response = await prompts(questions)
    })

function validateEmail(email) {
    const regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regex.test(String(email).toLowerCase())
}
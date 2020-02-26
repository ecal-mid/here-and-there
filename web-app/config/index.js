import development from './development.js'

const { NODE_ENV } = process.env

export default {
    development
}[NODE_ENV]
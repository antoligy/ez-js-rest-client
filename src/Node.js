const requirejs = require('requirejs')
const define = require('amdefine')(module)

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require
})

const CAPI = requirejs('CAPI')

const PromiseCAPI = requirejs('PromiseCAPI')
const SessionAuthAgent = requirejs('authAgents/SessionAuthAgent')
const HttpBasicAuthAgent = requirejs('authAgents/HttpBasicAuthAgent')

module.exports = Object.assign(CAPI, {PromiseCAPI, authAgents: {SessionAuthAgent, HttpBasicAuthAgent}})


const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

let mongoServer

/**
 * Starts an in-memory MongoDB server and connects Mongoose to it.
 * This is particularly useful for tests where you want a standalone, ephemeral database environment.
 *
 * @throws {Error} Throws an error if connection to the in-memory MongoDB fails.
 */
module.exports.dbConnect = async () => {
    try {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        })
    } catch (error) {
        console.error("Failed to connect to in-memory MongoDB", error)
        throw error // Rethrowing the error after logging it for debugging purposes
    }
}

/**
 * Disconnects Mongoose from the in-memory MongoDB server and stops the server.
 * This function helps in cleanly shutting down the database connection and server,
 * releasing all occupied resources.
 *
 * @throws {Error} Throws an error if disconnection or server stop fails.
 */
module.exports.dbDisconnect = async () => {
    try {
        await mongoose.disconnect()
        await mongoServer.stop()
    } catch (error) {
        console.error("Failed to disconnect and stop in-memory MongoDB", error)
        throw error // Rethrowing the error after logging it for debugging purposes
    }
}

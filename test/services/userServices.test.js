const { createUser, getAccountDetails } = require('../../services/userServices')
const User = require('../../models/User')
// const Author = require('../../models/Author');
const { dbConnect, dbDisconnect } = require('../mongoDBConfigTest')

// Chai is a ESM, so can't use 'require()'
before(async () => {
    const { expect } = await import('chai')
    global.expect = expect
})

describe('createUser', () => {
    beforeEach(async () => {
        await dbConnect()
    })

    afterEach(async () => {
        await dbDisconnect()
    })

    it('should create a new user with hashed password', async () => {
        const username = 'testuser';
        const email = 'test@example.com';
        const password = 'password123';
        
        // Verify that returned user is correct
        const newUser = await createUser(username, email, password)
        const passwordMatches = await newUser.verifyPassword(password)
        expect(newUser).to.exist
        expect(newUser.username).to.equal(username)
        expect(newUser.email).to.equal(email)
        expect(passwordMatches).to.be.true

        // Verify that the user was created in the database
        const foundUser = await User.findOne({ username })
        const passwordMatches2 = await foundUser.verifyPassword(password)
        expect(foundUser).to.exist
        expect(foundUser.username).to.equal(username)
        expect(foundUser.email).to.equal(email)
        expect(passwordMatches2).to.be.true
    })
})

// describe('getAccountDetails', () => {
//     it('should retrieve account details for a user', async () => {
//         const user = new User({ username: 'testuser', email: 'test@example.com' });
//         await user.save();

//         const accountDetails = await getAccountDetails(user);

//         // Verify that the account details are as expected
//         expect(accountDetails).to.have.property('email', user.email);
//         expect(accountDetails).to.have.property('username', user.username);
//         expect(accountDetails).to.have.property('userId', user._id.toString());
//         expect(accountDetails).to.have.property('isAuthor', false);
//         expect(accountDetails).to.not.have.property('authorId');
//     });

//     // Add more tests, including cases where the user is an author or there are errors fetching details.
// });

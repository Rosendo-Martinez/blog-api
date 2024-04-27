class User {
    #user_list

    constructor() {
        this.#user_list = [
            { username: 'genos', password: 'disciple1', id: '1' },
            { username: 'saitma', password: 'master1', id: '2' },
            { username: 'user', password: 'password1', id: '3' },
        ]
    }

    /**
     * Finds the user with the given username & password or return undefined.
     * 
     * @param {*} username 
     * @param {*} password 
     * @returns 
     */
    find(username, password) {
        return this.#user_list.find(u => u.username === username && u.password === password)
    }

    /**
     * Finds the user with the given Id or returns undefined.
     * 
     * @param {*} id 
     * @returns 
     */
    findById(id) {
        return this.#user_list.find(u => u.id === id)
    }
}

module.exports = new User()
class User {
    #user_list

    constructor() {
        this.#user_list = [
            { username: 'genos', password: 'disciple1', id: '1' },
            { username: 'saitma', password: 'master1', id: '2' },
            { username: 'user', password: 'password1', id: '3' },
        ]
    }

    find(cb) {
        return this.#user_list.find(cb)
    }
}

module.exports = User
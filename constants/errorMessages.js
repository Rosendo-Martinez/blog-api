const ERROR_MESSAGES = {
    USERNAME_LENGTH: 'Username must be minimum of 1 and a maximum of 30 characters.',
    USERNAME_ALREADY_IN_USE: 'Another user already has this username.',
    INVALID_EMAIL: 'Email must be valid.',
    EMAIL_ALREADY_IN_USE: 'Another user already has this email.',
    PASSWORD_LENGTH: 'Password must be between 4 and 25 characters long.',
    INCORRECT_PASSWORD: 'Password is incorrect.',
    USERNAME_MISSING: 'Username is required',
    PASSWORD_MISSING: 'Password is required',
    AUTHENTICATION_FAILURE: 'Authentication failed.',
    ACCOUNT_UPDATE_FAILED: 'Failed to update account.',
    GET_ACCOUNT_FAILED: 'Failed to get account.',
    CREATE_ACCOUNT_FAILED: 'Failed to create account.'
}

module.exports = ERROR_MESSAGES
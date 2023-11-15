const bcryptjs = require('bcryptjs');

function hashPassword(userPassword) {
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(userPassword, salt);
    return hash;
    }

function comparePassword(userPassword, hashedPassword){
    return bcryptjs.compareSync(userPassword, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
}

module.exports = class UserDto {
    email;
    id;
    avatar;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.avatar = model.avatar;
    }
}

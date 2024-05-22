export class UsersDTO {
  constructor(user) {
    this.first_name = user.first_name;
    this.last_name = user.last_name;

    if (this.last_name) {
      this.full_name = `${this.first_name} ${this.last_name}`;
    } else {
      this.full_name = this.first_name;
    }

    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.cart = user.cart;
  }
}

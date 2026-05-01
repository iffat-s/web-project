class UserRepository {
    constructor() {
      this.users = [];
      this.currentId = 1;
    }
  
    async findByEmail(email) {
      return this.users.find((user) => user.email === email) || null;
    }
    async login (email,password){
      return this.users.find((user) => user.email === email && user.password === password) || null;
    }
    async logout(refreshToken){
      const user = this.users.find((user) => user.refreshToken === refreshToken) || null;
      if (user) {
        user.refreshToken = null;
        console.log(`Logging out user: ${user.email}`);
      }
      return user;
    }
    async create(userData) {
      const user = {
        id: this.currentId++,
        ...userData
      };
   
  
      this.users.push(user);
      return user;
    }
  
    async findAll() {
      return this.users;
    }
  }
  
  module.exports = UserRepository;
  //not in papers
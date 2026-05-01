class UserController {
    constructor(userService) {
      this.userService = userService;
    }
  
    createUser = async (req, res) => {
      try {
        const user = await this.userService.createUser(req.body);
  
        return res.status(201).json({
          success: true,
          data: user
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    };

    login = async (req, res) => {
      try {
        const { email, password } = req.body;
        const { user, refreshToken } = await this.userService.login(email, password); 
    
        return res.status(200).json({
          success: true,
          message: "Login successful",
          refreshToken: refreshToken, 
          data: user
        });
      } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    };


    // login=async(req,res)=>{
    //   try {
    //     const { email, password } = req.body;
    //     const user = await this.userService.login(email, password); 
    //     return res.status(200).json({
    //       success: true,
    //       data: user
    //     });
    //   } catch (error) {
    //     return res.status(400).json({
    //       success: false, 
    //       message: error.message
    //     });
    //   }
    // };
    // logout=async(req,res)=>{
    //   try {
    //     const { email } = req.body;
    //     const user = await this.userService.logout(email); 
    //     return res.status(200).json({
    //       success: true,
    //       data: user
    //     });
    //   } catch (error) {
    //     return res.status(400).json({
    //       success: false, 
    //       message: error.message
    //     });
    //   }
    // };

    logout = async (req, res) => {
      try {
        const { refreshToken } = req.body;
    
        if (!refreshToken) {
          return res.status(400).json({ success: false, message: "Token required" });
        }
    
        await this.userService.logout(refreshToken); 
    
        return res.status(200).json({
          success: true,
          message: "Logged out successfully (token invalidated)"
        });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
    };


    getUsers = async (req, res) => {
      try {
        const users = await this.userService.getAllUsers();
  
        return res.status(200).json({
          success: true,
          data: users
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
    };
  }
  
  export default UserController;
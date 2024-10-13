import User, { IUser } from "../modules/userModel";


export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
    const user = new User(userData);
    return await user.save(); 
};


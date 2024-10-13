import jwt from 'jsonwebtoken';

export const generateToken = (id: string, role: string) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT secret is not defined");
    }

    return jwt.sign({ id, role }, secret, {
        expiresIn: '1h',
    });
};
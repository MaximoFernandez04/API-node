import jwt from "jsonwebtoken"

const secret = process.env.JWT_SECRET || "default-secret"
export const generateToken = (user)=>{
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            rol: user.rol
        },
        secret,    
        {expiresIn:'1h'} 
    )
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, secret); 
        return decoded;
    } catch (err) {
        throw new Error('Token inválido');
    }
};

export const verifyAdmin = (req, res, next) => {
    if(req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Se requiere rol de admin' });
    }
    next();
};

export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No existe token" });

    try {
        req.user = verifyToken(token); 
        next();
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
};
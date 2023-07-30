import jwt from "jsonwebtoken"
const {verify, sign} = jwt;

const SECRET = 'taf162023'

export const generarJWT = async (data) => {
    return sign(data, SECRET, {
        expiresIn: '15d',
    });
} 

export const validarJWTToken = async (req, res, next) => {
    const authHeaders = req.headers.authorization;
    
    if (!authHeaders || !authHeaders.startsWith('Bearer')) {
        res.status(403).json({
            msg: 'Token Inválido o no encontrado',
            error: true
        });
        return;
    }

    let token = authHeaders.split(' ')[1];

    if (!token) {
        res.status(404).json({
            msg: 'No existe un token para validar',
            error: true
        });
        return;
    }

    const decodedData = verify(token.trim(), SECRET, (err, user) => {
        
        if (err) {
            res.status(403).json({
                msg: 'Token JWT Inválido',
            });
        } else {
            req.user = user;
            next();
        }
    });
}
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authMiddleWare = (req, res, next) => {
    if (req.method === "OPTIONS") {
        next();
    }

    try {

        const fullToken = req.headers.authorization.split(' ');
        if (fullToken[0] != "Bearer") {
            return res.status(400).json({ message: 'Token should start from Bearer' });
        }

        if (!fullToken[1]) {
            return res.status(400).json({ message: 'Token is not exist' });
        }

        const decodeData = jwt.verify(fullToken[1], process.env.SECRET_JWT_TOKEN)

        req.user = decodeData;

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Not Authorized' });
    }
}

export const roleMiddleWare = (roles) => {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {

            const fullToken = req.headers.authorization.split(' ');
            if (fullToken[0] != "Bearer") {
                return res.status(400).json({ message: 'Token should start from Bearer' });
            }

            if (!fullToken[1]) {
                return res.status(400).json({ message: 'Token is not exist' });
            }

            const { role: userRole } = jwt.verify(fullToken[1], process.env.SECRET_JWT_TOKEN)

            let hasRole = false;

            if (roles.includes(userRole)) {
                hasRole = true;
            }

            if (!hasRole) {
                return res.status(403).json({ message: `To perform this requst you should have roles like: ${roles}` });
            }

            next();

        } catch (error) {
            return res.status(403).json({ message: 'Not Authorized' });
        }
    }
}

export const idMiddleWare = async (req, res, next) => {
    if (req.method === "OPTIONS") {
        next();
    }
    try {

        const fullToken = req.headers.authorization.split(' ');
        if (fullToken[0] != "Bearer") {
            return res.status(400).json({ message: 'Token should start from Bearer' });
        }

        if (!fullToken[1]) {
            return res.status(400).json({ message: 'Token is not exist' });
        }

        const { id: userId } = jwt.verify(fullToken[1], process.env.SECRET_JWT_TOKEN);

        req.id = userId;

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Not Authorized' });
    }
}
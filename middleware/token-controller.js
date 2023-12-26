const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_ACCESS_SECRET;

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    jwt.verify(token.split(' ')[1], SECRET, (err, decoded) => {
        console.log('Decoded token:', decoded);
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = req.user || {};
        req.user.id = decoded.id;
        req.decodedToken = decoded;

        next();
    });
}
function verifyTokenAdmin(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    jwt.verify(token.split(' ')[1], SECRET, (err, decoded) => {
        console.log('Decoded token:', decoded);
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Check if the decoded token has a specific username (e.g., "Boba123")
        if (decoded.username === 'Boba123') {
            req.user = req.user || {};
            req.user.id = decoded.id;
            req.decodedToken = decoded;

            next();
        } else {
            return res.status(403).json({ error: 'Access forbidden for this user' });
        }
    });
}
module.exports = {
    verifyToken,
    verifyTokenAdmin
}
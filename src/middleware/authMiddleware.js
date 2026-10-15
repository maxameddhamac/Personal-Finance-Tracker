import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Ka soo qaado token-ka headers-ka
      token = req.headers.authorization.split(" ")[1];

      // Xaqiiji token-ka
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ku dar user-ka request-ka
      req.user = decoded;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

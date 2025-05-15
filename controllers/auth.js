import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find User and select password field if needed
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword)
      return res.status(400).json({ message: "Invalid email or password" });

    // Remove password from user object for security
    user.password = undefined;

    // Generate token
    const token = generateJWT(user);

    // Define cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use secure cookies in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    };

    // Set the token as a cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ message: "Account with that email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword });
    user.password = undefined;
    const token = generateJWT(user);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookieOptions);
    res.status(202).json({ user, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const me = (req, res) => {
  res.status(200).json({ user: req.user });
};

export const signOut = (req, res) => {
  res.clearCookie("token").sendStatus(200);
};

function generateJWT(user) {
  // Customize your payload and expiration as needed
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SIGNATURE,
    {
      expiresIn: "1d",
    }
  );
}

export const findUser = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  res.json({ userFound: user ? true : false });
};

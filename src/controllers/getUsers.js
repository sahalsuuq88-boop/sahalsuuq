import User from "../model/User.js";

export const GetUsers = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const total = await User.countDocuments();

    const users = await User.find()
        .skip(skip)
        .limit(limit)
        .select("-password");

    res.json({
        success: true,
        page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        users,
    });
};
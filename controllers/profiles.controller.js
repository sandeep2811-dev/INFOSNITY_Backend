import { loginUser } from "./user.controller.js";
import db from "../config/database.js";

const getLoggedUserDetails = async (req, res) => {
    try {
        const userId = req.session.user_id; // set at login

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not logged in"
            });
        }

        const query = `
            SELECT
                u.email,
                u.role,

                p.idno,
                p.name,
                p.branch,
                p.year,
                p.section,
                p.phone_no,
                p.cgpa,
                p.skills,
                p.achievements,
                p.extra_circular_activities,
                p.interests,
                p.links
            FROM users u
            LEFT JOIN users_profile p
            ON u.user_id = p.user_id
            WHERE u.user_id = $1;
        `;

        const { rows } = await db.query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
            const data = rows[0];

            // convert comma-separated strings to arrays
            const arrayFields = [
                "skills",
                "achievements",
                "links",
                "extra_circular_activities",
                "interests"
            ];

            arrayFields.forEach(field => {
                if (data[field] && typeof data[field] === "string") {
                    data[field] = data[field]
                        .split(",")
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                }
            });



        res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get logged user error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
const updateLoggedUserDetails = async (req, res) => {
    try {
        const userId = req.session.user_id; // or req.user.user_id (JWT)

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not logged in"
            });
        }

        const {
            idno,
            name,
            branch,
            year,
            section,
            phone_no,
            cgpa,
            skills,
            achievements,
            extra_circular_activities,
            interests,
            links
        } = req.body;

        const query = `
            INSERT INTO users_profile (
                user_id,
                idno,
                name,
                branch,
                year,
                section,
                phone_no,
                cgpa,
                skills,
                achievements,
                extra_circular_activities,
                interests,
                links
            )
            VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                idno = EXCLUDED.idno,
                name = EXCLUDED.name,
                branch = EXCLUDED.branch,
                year = EXCLUDED.year,
                section = EXCLUDED.section,
                phone_no = EXCLUDED.phone_no,
                cgpa = EXCLUDED.cgpa,
                skills = EXCLUDED.skills,
                achievements = EXCLUDED.achievements,
                extra_circular_activities = EXCLUDED.extra_circular_activities,
                interests = EXCLUDED.interests,
                links = EXCLUDED.links
            RETURNING *;
        `;

        const result = await db.query(query, [
            userId,
            idno,
            name,
            branch,
            year,
            section,
            phone_no,
            cgpa,
            skills,
            achievements,
            extra_circular_activities,
            interests,
            links
        ]);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};


export {getLoggedUserDetails,updateLoggedUserDetails};
import express from "express";
import db from "../config/database.js";
import { loginUser } from "./user.controller.js";

const   sendMail = async(req,res)=>{

    const {toEmail,subject,message} = req.body;

    const fromEmail = req.session.userEmail;
    console.log(fromEmail,"ooooooooooooooooooooooooooooooooooo");

    try{
        await db.query("insert into mails values($1,$2,$3,$4,$5)",[fromEmail,toEmail,subject,message,req.session.role]);
        res.json("mail sent sucessfully.");
    }catch(error){
        console.log(error);
        res.json("please try again later");
    }

}


const displayMail = async (req, res) => {
    const role = req.session.role;
    const userEmail = req.session.userEmail;

    console.log("Email:", userEmail);
    console.log("Role:", role);

    const role1 = "faculty";
    const role2 = "administration";

    if (role === "student") {
        try {
            const result = await db.query(
                "SELECT * FROM mails WHERE role = $1 OR role = $2 OR toemail=$3",
                [role1, role2,userEmail]
            );
            const query = `
            SELECT
                fromemail,
                subject,
                message
            FROM
                mockrequestmails
            WHERE
                -- Check all four possible positions for the email in the comma-separated string:
                toemail = $1                                -- Case 1: Exact match (only recipient)
                OR toemail LIKE $1 || ',%'                  -- Case 2: Match at the start (followed by a comma)
                OR toemail LIKE '%,' || $1                  -- Case 3: Match at the end (preceded by a comma)
                OR toemail LIKE '%,' || $1 || ',%';         -- Case 4: Match in the middle (surrounded by commas)
        `;

        const result2 = await db.query(query, [userEmail]);

            console.log(result);
            console.log(result2);
            
            
            return res.json({ message: "Mails fetched successfully", result:result.rows,mockrequests:result2.rows });
        } catch (err) {
            console.error(err);
            return res.json("There is an error in fetching mails");
        }
    }

    if (role === "faculty") {
        try {
            const result = await db.query(
                "SELECT * FROM mails WHERE toemail = $1",
                [userEmail]
            );
            console.log(result.rows);
            return res.json({ message: "Mails fetched successfully", result:result.rows });
        } catch (err) {
            console.error(err);
            return res.json("There is an error in fetching mails");
        }
    }

    if (role === "administration") {
        try {
            const result = await db.query(
                "SELECT * FROM mails WHERE toemail = $1",
                [userEmail]
            );
            return res.json({ message: "Mails fetched successfully", result:result.rows });
        } catch (err) {
            console.error(err);
            return res.json("Error in fetching mails");
        }
    }

        return res.json("Invalid user role");
};


export {sendMail,displayMail};
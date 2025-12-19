import express from "express";
import db from "../config/database.js";
import { loginUser } from "./user.controller.js";
import router from "../routes/user.route.js";


const mentions = async(req,res)=>{
        const {message} = req.body;
        console.log("succcccccccccccccccccccccccccccccccccccccccccccccc ypi &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&77");
        
        // Find all mentions
        const mentions = [...message.matchAll(/#([\w.+-]+@[\w.-]+\.\w+)/g)].map(m => m[1]); // extract only the email

        const toemails = mentions.join(",");

        // Remove mention tags from message
        const cleanMessage = message.replace(/#([\w.+-]+@[\w.-]+\.\w+)/g, "").trim();

        console.log("Mentions:", mentions);
        console.log("Original Message:", cleanMessage);

        const userEmail = req.session.userEmail;
        try{
            await db.query("insert into mentions values($1,$2,$3)",[userEmail,toemails,cleanMessage]);
            res.json("mentioned sucessfully");
        }
        catch{
            res.json("error in mentioning");
        }


}

const retriveMentions = async(req,res)=>{
    const userEmail = req.session.userEmail;
    try{
        const result = await db.query(`SELECT * FROM mentions WHERE $1 = ANY(string_to_array(toemails, ','))`,[userEmail])
        res.json({message:"mentions fetched sucessfully",result:result});

    }
    catch{res.json("error in fetching messages")};
}

export {mentions,retriveMentions};
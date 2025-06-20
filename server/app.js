const express=require('express');
require('dotenv').config();
const cookieParser=require('cookie-parser')
const cors=require('cors');
const app=express();


const allowedOrigins=['*'];

app.use(cors({
    origin:function (origin,callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null,true);
        }else{
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

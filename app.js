const { Console } = require("console");
const express = require("express");
const app = express();
const https = require("https");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("resources"));

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html");
});

app.get("/success", (req, res)=>{
    res.redirect("/");
});

app.get("/failure", (req, res)=>{
    res.redirect("/");
});

app.post("/", (req, res)=>{

    try {

        const postingObject={
            members : [{
                email_address:req.body.EmailId,
                status:"subscribed",
                merge_fields:{
                    FNAME: req.body.Name,
                    LNAME: req.body.Surname
                }
            }]
        }
    
        const postingObjectStringified = JSON.stringify(postingObject);
        
        const listId = "ee54c5bacb";
        const URL = "https://us6.api.mailchimp.com/3.0/lists/" + listId + "?skip_merge_validation=True&skip_duplicate_check=True"; 
        const option = {
            method:"POST",
            auth: "som:b5efc9a4cff0bc63d9812a529e5429fa-us6"
        };
    
        const connection = https.request(URL, option, (response)=>{
    
            console.log(response.statusCode);
    
            if (response.statusCode===200){
                
                response.on("data", (response_data)=>{
                    const response_data_JSON = JSON.parse(response_data);
                    console.log(response_data_JSON);
                    console.log("response_data.error_count is [" + response_data_JSON.error_count + "]");
                    
                    if (response_data_JSON.error_count===0 || response_data_JSON.error_count === undefined){
                        console.log("Audience created");
                        res.sendFile(__dirname + "/success.html");
                    }
                    else{
                        console.log("Business logic failure");
                        res.sendFile(__dirname + "/failure.html");        
                    }
    
                });    
    
            }else{
                console.log("Connection failure");
                res.sendFile(__dirname + "/failure.html");
    
            }
        
        });
        connection.write(postingObjectStringified);        
        connection.end();

    } catch (e){

        console.log("Inside error handler");
        res.sendFile(__dirname + "/failure.html");
    }

    
});

app.listen(PORT, ()=>{
    console.log("Server started in running mode at [" + PORT +"]");
});


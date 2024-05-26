require("dotenv").config();
const { app } = require("./app");
const { connectdb } = require("./dbConfig/db");



connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log('database connection failed!!!')
})
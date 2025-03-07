import express from "express"
import bodyParser from "body-parser"
import pg from 'pg';
import methodoverride from "method-override";
import {body, validationResult} from "express-validator";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;


const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("render.com") 
      ? { rejectUnauthorized: false }  // Enable SSL for Render
      : false  // Disable SSL for local DBs
});

db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL!"))
  .catch(err => console.error("❌ Database connection error:", err));
  

  function setDate(books){
    books.forEach((book) => {
        book.dateread = new Date(book.dateread);
        const formattedDate = book.dateread.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
        
        book.dateread = formattedDate;
    })
    
    return books;
  }

 async function getBooks(){
    var books = [];
    const result = await db.query('SELECT * FROM bookslist');
    books = result.rows

    console.log(setDate(books))
    return books;
}

//Declare static files
app.use(express.static("public"))

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodoverride('_method'));

app.get("/", async (req,res) => {
    const books = await getBooks();
    res.render("index.ejs",{books : books});
})

app.get("/new",(req,res) => {
    res.render("new.ejs");
})

//Sort by latest
app.get("/latest",async (req,res) => {
    var latestBooks = [];
    const result = await db.query('SELECT * FROM bookslist ORDER BY dateread DESC');
    latestBooks = result.rows

    res.render("index.ejs",{books:setDate(latestBooks)})
})

//Sort by best
app.get("/best",async (req,res) => {
    var bestBooks = [];
    const result = await db.query('SELECT * FROM bookslist ORDER BY rating DESC');
    bestBooks = result.rows

    res.render("index.ejs",{books:setDate(bestBooks)})
})

//Sort by title
app.get("/titleSort",async (req,res) => {
    var books = [];
    const result = await db.query('SELECT * FROM bookslist ORDER BY title ASC');
    books = result.rows

    res.render("index.ejs",{books:setDate(books)})
})

// Get request to send the new.ejs when Edit is clicked
app.get("/edit/:id",async (req,res) => {
    const id = req.params.id;
    try{
       const result =  await db.query("SELECT * FROM bookslist WHERE id = $1",[id]);

       if(result.rowCount === 0){
        console.log("No book found")
       }
       console.log(setDate(result.rows))
       res.render("new.ejs",{book:setDate(result.rows)});

    }catch(err){
        console.log(err);
        res.redirect("/");
    }
})

app.put("/edit/:id",[
    body('title').isLength({min:3}).withMessage("Title must have min 3 characters"),
    body('summary').isLength({min:10}).withMessage("Summary must have between 10 to 300 characters"),
    body('isbn').isLength({min:13,max:13}).withMessage("ISBN must be exactly 13 digits")
], async (req,res) => {
    const id = req.params.id;
    req.body.id = id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var book = [];
        book.push(req.body);
        return res.render("new.ejs",{ errors: errors.array() , book: book});
    }

    const updates = req.body;

    try{
        await db.query("UPDATE bookslist SET title = $1, author = $2, summary = $3, isbn = $4, rating = $5, link = $6 WHERE id = $7",[updates.title,updates.author,updates.summary,updates.isbn,updates.rating,updates.link,id]);
        res.redirect("/");
    }catch(err){
        console.log(err);
        res.redirect("/");
    }
})

app.delete("/delete/:id",async (req,res) => {
    const id = req.params.id;
    try{
       const result =  await db.query("DELETE FROM bookslist WHERE id = $1",[id]);

       console.log(result);
       if(result.rowCount === 0){
        console.log("No book found")
       }
       res.redirect("/");
    }catch(err){
        console.log(err);
        res.redirect("/");
    }
})

app.post("/new",[
    body('title').isLength({min:3}).withMessage("Title must have min 3 characters"),
    body('summary').isLength({min:10}).withMessage("Summary must have between 10 to 300 characters"),
    body('isbn').isLength({min:13,max:13}).withMessage("ISBN must be exactly 13 digits")
], async (req,res) => {

    req.body.id = 0;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        var book = [];
        book.push(req.body);
        return res.render("new.ejs",{ errors: errors.array() , book: book});
    }

    const title = req.body.title;
    const summary = req.body.summary;
    const isbn = req.body.isbn;
    const rating = req.body.rating;
    const author = req.body.author;
    const link = req.body.link;

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").split('/').join('-');
    
    try{
        await db.query("INSERT INTO bookslist (author,title,summary,dateread,rating,link,isbn) VALUES ($1,$2,$3,$4,$5,$6,$7)",[author,title,summary,formattedDate,rating,link,isbn])
        res.redirect("/");
    }catch(err){
        console.log("Error in insertion ",err);
    }

})

app.listen(port, () => {
    console.log(`Server connected to port ${port}`)
})

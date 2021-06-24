//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require('lodash')


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-taras:test123@cluster0.p55w9.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Buy Food',
})
const item2 = new Item({
  name: 'Cook Food'
})
const item3 = new Item({
  name: 'Eat Food!'
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model('List', listSchema)



app.get("/", function(req, res) {


Item.find({}, (err, foundItems)=>{

if(foundItems.length===0){
Item.insertMany(defaultItems, (err)=>{
  if(err){
    console.log(err)
        } else {
    console.log('successfully uploded DB');
      }
  })
  res.redirect('/');
} else {
    res.render("list", {listTitle: 'Today', newListItems: foundItems});
}
})
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  })

  if(listName === 'Today'){
     item.save()
  res.redirect('/')
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName)
    } )
  }
 
});

app.post('/delete', (req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
    Item.findByIdAndRemove(checkedItemId, (err)=>{
    if (err){
      console.log(err);
    } else {
      console.log('Sucsesfyly deletet');
      res.redirect('/')
    }
  })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, 
      (err, foundList)=>{
        if(!err){
          res.redirect('/' + listName)
        }
      } )
  }

  
})

app.get('/:customListName', (req, res)=>{
const cln = _.capitalize( req.params.customListName);

List.findOne({name: cln}, (err, foundList)=>{
  if(!err){
    if(!foundList){
      console.log('doest exist');
      const list = new List ({
    name: cln,
    items: defaultItems
    });
list.save();
res.redirect('/' + cln)
    } else {
          console.log('exist')
res.render('list',{listTitle: foundList.name, newListItems: foundList.items} )
    }
  } 
} )
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, ()=>{ 
  console.log("Server started on port 3000")
});

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
var d = new Date();
var n = d.getDay();
var daylist = ["Sunday","Monday","Tuesday","Wednesday ","Thursday","Friday","Saturday"];
console.log("Today is : " + daylist[n] + ".");

var t = new Date(); // for now
d.getHours(); // => 9
d.getMinutes(); // =>  30
d.getSeconds(); // => 51
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));


mongoose.connect("mongodb+srv://admin-logicalbin:AUGUST18@cluster0.iiaa1.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: {type:String},
  time:{type:String},
};
console.log(d.getHours());
const Item = mongoose.model("Item", itemsSchema);

const item2 = new Item({
  name: "Hit the + button to add a new item",
  time:d.getHours().toString()
});
const item3 = new Item({
  name: "🠔Hit this to delete an item",
  time:d.getHours().toString()

});
const item1 = new Item({
  name: "Welcome to your to-do list",
  time:d.getHours().toString()

});


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("elements added");
        }
      });
    }

    res.render("list", {
      
      listTitle: daylist[n],
      newListItems: foundItems
    });
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName,
    time:d.getHours().toString()
  });

  if (listName ===  daylist[n]) {
    item.save();
    res.redirect('/')

  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      try {
      res.redirect("/" + listName);
        
      } catch (error) {
        res.redirect("/");
      }
    });
  }

});


app.get('/users/:customListName',(req, res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/users" + customListName);
        console.log("dosent exist");
      } else {
        console.log("already exists");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
        
      }
    }
  })
})
// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
        console.log("dosent exist");
      } else {
        console.log("already exists");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })


})

app.post("/delete", function(req, res) {
  const checkboxId = req.body.checkbox;
  const listName=req.body.listName;

  if(listName=== daylist[n]){
    Item.findByIdAndDelete(checkboxId, function(err) {
      if (err) console.log(err);
      console.log("Successful deletion");
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }


});

app.get("/about", function(req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});


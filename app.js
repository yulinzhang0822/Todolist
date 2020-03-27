//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connect with MongoDB using Mongoose
mongoose.connect("mongodb+srv://admin-yulin:zyllxh08221024%23GZ@cluster0-yanef.mongodb.net/todolistDB", {useNewUrlParser: true});

// Create a schema of a collection
const itemsSchema = {
  name: String
};

// Create a new model using the schema
const Item = mongoose.model("Item", itemsSchema);

// Create three default documents using the model
const item1 = new Item({
  name: "Enter new things to do or check the box to delete"
});

const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if(err) {
      //console.log(err);
    } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(err) {
      console.log(err);
    } else {
      if(!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today") {
    //console.log("Successfully inserted the item into the database!");
    if(item.name.length !== 0) {
      item.save();
    }
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      if(item.name.length !== 0) {
        foundList.items.push(item);
        foundList.save();
      }
    });
    res.redirect("/" + listName);
  }
});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err) {
      if(err) {
        //console.log(err);
      } else {
        //console.log("Successfully deleted the item");
        res.redirect("/");
      }
    });
  } else {
    // Delete a document from a document array
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList) {
      if(err) {
        console.log(err);
      } else {
        //console.log("Successfully deleted the item");
      }
      res.redirect("/" + listName);
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});

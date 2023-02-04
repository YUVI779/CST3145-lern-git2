const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const routers = express.Router();
const path = require("path");
const { MongoClient } = require("mongodb");
const fs = require("fs");
app.use(cors());

const { ObjectId } = require("mongodb");

const LOGGERmidleware = (req, res, next) => {
  console.log(
    "MIDDLEWARE FOR ALL REQUEST ",
    `${req.method} ${req.originalUrl}`
  );
  next();
};

app.use(express.json());
async function MAINfunction() {
  var SERVERREQUEST = new MongoClient(
    `mongodb+srv://yuvi:yuvi123@cluster0.kh8erhi.mongodb.net/?retryWrites=true&w=majority`
  );
  try {
    await SERVERREQUEST.connect();
    await SERVERREQUEST.db("test")
      .collection("orders")
      .deleteMany({})
      .then((res) => {})
      .catch((err) => {
        console.log(err);
      });
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => {
      SERVERREQUEST.close();
    }, 1500);
  }
}

routers.get("/lessons", (req, res, next) => {
  let SERVERREQUEST = MONGODBCONNECTION();
  AllDatabase(SERVERREQUEST).then((data) => {
    res.send(data);
  });
});



function MONGODBCONNECTION() {
  let SERVERREQUEST = new MongoClient(
    `mongodb+srv://yuvi:yuvi123@cluster0.kh8erhi.mongodb.net/?retryWrites=true&w=majority`
  );
  SERVERREQUEST.connect();
  return SERVERREQUEST;
}



routers.post("/lessons", (req, res, next) => {
  let SERVERREQUEST = MONGODBCONNECTION();
  createProduct(SERVERREQUEST, req.body)
    .then((msg) => {
      res.send("Created Successfully");
    })
    .catch((error) => {
      res.status(404).send("ERRORSS");
    });
});

app.use("/image-lesson", StaticIMAGEMiddleware);

routers.get("/orders", (req, res, next) => {
  let SERVERREQUEST = MONGODBCONNECTION();
  getOrderList(SERVERREQUEST).then((data) => {
    res.send(data);
  });
});

routers.delete("/lessons/:id", (req, res) => {
  let SERVERREQUEST = MONGODBCONNECTION();
  DeleteLessons(SERVERREQUEST, req.params.id)
    .then((msg) => {
      res.send(`deleted successfully`);
    })
    .catch((error) => {
      res.status(404).send(error);
    });
});


routers.post("/orders", (req, res, next) => {
  let SERVERREQUEST = MONGODBCONNECTION();
  createOrder(SERVERREQUEST, req.body)
    .then((msg) => {
      if (msg) {
        res.send(`Successfully Created`);
      } else {
        res.status(404).send(`${req.body.lessonName}  out of stock`);
      }
    })
    .catch((error) => {
      res.status(404).send("ERROR");
    });
});

async function getOrderList(product) {
  const db = await product.db("test").collection("orders").find().toArray();
  if (db) {
    return db;
  } else {
    const message = `Sorry no data available`;
    return message;
  }
}


routers.put("/lessons/:id", (req, res) => {
    let SERVERREQUEST = MONGODBCONNECTION();
    LessonUpdate(SERVERREQUEST, req.params.id, req.body)
      .then((data) => {
        res.send(`updated Successfully`);
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  });

routers.delete("/orders", (req, res) => {
  let SERVERREQUEST = MONGODBCONNECTION();
  deleteOrders(SERVERREQUEST, req.params.id)
    .then((msg) => {
      res.send(`deleted successfully`);
    })
    .catch((error) => {
      res.status(404).send(error);
    });
});

async function SeacrhByName(SERVERREQUEST, searchedText) {
  let serachRESULT = await SERVERREQUEST.db("test")
    .collection("lessonsItems")
    .find({
      name: searchedText,
    })
    .toArray();
  return serachRESULT;
}

async function createProduct(SERVERREQUEST, newListing) {
  const result = await SERVERREQUEST.db("test")
    .collection("lessonsItems")
    .insertOne(newListing);
  return result;
}

async function createOrder(server, SERVERREQUEST) {
  let serverData = server.db("test").collection("orders");
  let lessonSelected = await server
    .db("test")
    .collection("lessonsItems")
    .findOne({
      _id: new ObjectId(SERVERREQUEST.lessonId),
    });
  let id = lessonSelected._id.toString();
  if (lessonSelected.space) {
    lessonSelected.space = lessonSelected.space - 1;
    serverData.insertOne(SERVERREQUEST);
    LessonUpdate(server, id, lessonSelected)
      .then((data) => {})
      .catch((error) => {});
    return true;
  } else {
    return false;
  }
}

async function deleteOrders(SERVERREQUEST, id) {
  await SERVERREQUEST.db("test")
    .collection("orders")
    .deleteMany({})
    .then((res) => {})
    .catch((err) => {});
  return result;
}



routers.post("/search", (req, res, next) => {
    let SERVERREQUEST = MONGODBCONNECTION();
    SeacrhByName(SERVERREQUEST, req.body.text)
      .then((data) => {
        res.send(data);
      })
      .catch((error) => {
        res.status(404).send("ERRORSS");
      });
  });

async function AllDatabase(product) {
  const db = await product.db("test").collection("lessonsItems").find().toArray();
  if (db) {
    return db;
  } else {
    const message = `no data`;
    return message;
  }
}

async function LessonUpdate(SERVERREQUEST, id, newData) {
  const result = await SERVERREQUEST.db("test")
    .collection("lessonsItems")
    .updateOne({ _id: new ObjectId(id) }, { $set: newData }, (err, result) => {
      SERVERREQUEST.close();
    });
  return result;
}

async function DeleteLessons(SERVERREQUEST, id) {
  const result = await SERVERREQUEST.db("test")
    .collection("lessonsItems")
    .deleteOne({ _id: new ObjectId(id) }, (err, result) => {
      SERVERREQUEST.close();
    });
  return result;
}

const StaticIMAGEMiddleware = (req, res) => {
    const imagepath = path.join(__dirname, "image-lesson", req.url);
    fs.stat(imagepath, (err, stats) => {
      if (err) {
        res.status(404).send("Empty folder");
        return;
      }
      fs.createReadStream(imagepath).pipe(res);
    });
  };

app.use(LOGGERmidleware);
app.use("/", routers);
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

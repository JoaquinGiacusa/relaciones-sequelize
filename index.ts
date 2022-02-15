import * as express from "express";
import { sequelize } from "./db/connection";

import { User, Product, Auth } from "./db/models";

import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

// sequelize.sync({ force: true }).then((res) => {
//   console.log(res);
// });
//sequelize.sync({ force: true });

const SECRET = "asdasdasd123123123";

function getSHA256ofString(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

const port = process.env.PORT || 3005;
const app = express();
app.use(express.json());

/* //test
app.get("/test", async (req, res) => {
  // const user = await User.create({
  //   username: "Joaquin",
  // });

  // const product = await Product.create({
  //   title: "Mate 2",
  //   price: 500,
  //   userId: "1",
  // });
  const product = await Product.findAll({
    where: {
      userId: 1,
    },
    include: [User],
  });

  res.json(product);
}); */

//signup
app.post("/auth", async (req, res) => {
  const { email, fullName, birthday, password } = req.body;

  const [user, created] = await User.findOrCreate({
    where: { email: email },
    defaults: {
      email: email,
      fullName: fullName,
      birthday: birthday,
    },
  });
  const [auth, authCreated] = await Auth.findOrCreate({
    where: { user_id: user.get("id") },
    defaults: {
      email: email,
      password: getSHA256ofString(password),
      user_id: user.get("id"),
    },
  });
  console.log({ created, authCreated });

  res.json({ user, auth });
});

//signin or login
app.post("/auth/token", async (req, res) => {
  const { email, password } = req.body;
  const passwordHashed = getSHA256ofString(password);

  const auth = await Auth.findOne({
    where: { email, password: passwordHashed },
  });

  if (auth === null) {
    res.status(400).json({ error: "email or pass incorrect" });
  } else {
    const token = jwt.sign({ id: auth.get("user_id") }, SECRET);
    res.json({ token });
  }
});

function authMiddleware(req, res, next) {
  const splitted = req.headers.authorization.split(" ");
  const token = splitted[1];

  try {
    const data = jwt.verify(token, SECRET);
    req._user = data;
    next();
  } catch (e) {
    res.status(401).json({ error: true });
  }
}

app.get("/me", authMiddleware, async (req, res) => {
  console.log(req._user.id);

  //const user = await User.findByPk(req._user.id);
  const user = await User.findByPk(1);
  res.json(user);
});

//POST /products
app.post("/products", authMiddleware, async (req, res) => {
  //const { price, title } = req.body;

  const product = await Product.create({
    //  price,
    //  title,
    ...req.body,
    userId: req._user.id,
  });
  res.json(product);
});

app.get("/me/products", authMiddleware, async (req, res) => {
  //const user = await User.findByPk(req._user.id);
  const allProducts = await Product.findAll({
    where: { userId: req._user.id },
    include: [User],
  });
  res.json(allProducts);
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

// //get all
// app.get("/products", async (req, res) => {
//   const allProd = await Product.findAll();
//   res.json(allProd);
// });

// //post a new product
// app.post("/products", async (req, res) => {
//   const product = await Product.create(req.body);
//   res.json(product);
// });

// //get one prod by ID
// app.get("/products/:productId", async (req, res) => {
//   const { productId } = req.params;

//   const prodById = await Product.findAll({
//     where: { id: productId },
//   });
//   res.json(prodById);
// });

// //modicar uno por id
// app.patch("/products/:productId", async (req, res) => {
//   const { productId } = req.params;

//   const product = await Product.update(req.body, {
//     where: {
//       id: productId,
//     },
//   });

//   res.json(product);
// });

// //borrar uno por id
// app.delete("/products/:productId", async (req, res) => {
//   const { productId } = req.params;

//   const prodById = await Product.destroy({
//     where: { id: productId },
//   });

//   res.json({ message: "deleted" });
// });

// app.listen(port, () => {
//   console.log(`app listening at http://localhost:${port}`);
// });

// /* DE LAS CLASES

// async function main() {
//   //await sequelize.sync({ alter: true });
//   // const jane = await User.create({
//   //   username: "janedoe",
//   //   birthday: new Date(1980, 6, 20),
//   // });
//   // console.log(jane.toJSON());
//   // const todos = await User.findAll();
//   // console.log(todos);
//   // const user2 = await User.findByPk(2);
//   // console.log("segundo LOG", user2.get());

//   // const newProduct = await Product.create({
//   //   price: 3333,
//   //   title: "nuevo producto",
//   // });

//   //console.log(newProduct);

//   const allProd = await Product.findAll();
//   console.log(allProd);

//   // const prod2 = await Product.findByPk(3);
//   // console.log(prod2.get());
// }

// main();

// // function main() {
// //   sequelize.authenticate().then((res) => {
// //     console.log(res);
// //   });
// // } */

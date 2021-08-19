const router = require("express").Router();
const { Collection, Item, User } = require("../models");
const withAuth = require("../utils/auth");

router.get("/", async (req, res) => {
  try {
    // Get all projects and JOIN with user data
    const collectionData = await Collection.findAll({
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    // Serialize data so the template can read it
    const collections = collectionData.map((collection) => collection.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render("homepage", {
      collections,
      style: 'homepage.css',
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/collection/:id", async (req, res) => {
  try {
    const collectionData = await Collection.findByPk(req.params.id, {
      include: [
        {
          model: Item,
        },
      ],
    });

    const collection = collectionData.get({ plain: true });

    res.render("collection", {
      ...collection,
      style: 'collection.css',
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/item/:id", async (req, res) => {
  try {
    const itemData = await Item.findByPk(req.params.id, {});

    const item = itemData.get({ plain: true });

    res.render("item", {
      ...item,
      style: 'item.css',
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get("/profile", withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Collection, Item }],
    });

    const user = userData.get({ plain: true });

    res.render("profile", {
      ...user,
      style: 'profile.css',
      loggedIn: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/login", (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.loggedIn) {
    res.redirect("/profile");
    return;
  }
  res.render("login", {
    style: 'login.css',
  });
    
});

module.exports = router;

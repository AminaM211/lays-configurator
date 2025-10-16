const express = require("express");
const router = express.Router();

let chips = [
  { id: 1, name: "Paprika", brand: "Lay's" },
  { id: 2, name: "Naturel", brand: "Lay's" },
  { id: 3, name: "Pickles", brand: "Lay's" },
];

// GET /api/v1/bags → alle chips ophalen
router.get("/", (req, res) => {
  res.json(chips);
});

// POST /api/v1/bags → nieuwe chip toevoegen
router.post("/", (req, res) => {
  const { name, brand } = req.body;

  // check of velden ingevuld zijn
  if (!name || !brand) {
    return res.status(400).json({ error: "Name and brand are required." });
  }

  //ik stuur momenteel enkel 1, je moet alle kunne sturen
  const newChip = {
    id: chips.length + 1,
    name,
    brand,
  };

  chips.push(newChip);
  res.status(201).json(newChip);
});

module.exports = router;

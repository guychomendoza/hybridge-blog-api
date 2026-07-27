const express = require('express');
const router = express.Router();
const { Author } = require('../models');
const requireAuth = require('../middlewares/auth');

// --- Operación: READ ALL (pública) ---
router.get('/', async (req, res) => {
  try {
    const authors = await Author.findAll();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los autores', detalle: error.message });
  }
});

// --- Operación: READ ONE (pública) ---
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    res.json(author);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el autor', detalle: error.message });
  }
});

// --- Operación: CREATE (protegida) ---
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El campo name es requerido' });
    }

    const newAuthor = await Author.create({ name });
    res.status(201).json(newAuthor);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el autor', detalle: error.message });
  }
});

// --- Operación: UPDATE (protegida) ---
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    await author.update({
      name: name !== undefined ? name : author.name
    });

    res.json({ message: 'Autor actualizado correctamente', author });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el autor', detalle: error.message });
  }
});

// --- Operación: DELETE (protegida) ---
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    await author.destroy();
    res.json({ message: 'Autor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el autor', detalle: error.message });
  }
});

module.exports = router;    
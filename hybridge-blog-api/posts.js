const express = require('express');
const router = express.Router();
const { Post } = require('../models');
const requireAuth = require('../middlewares/auth');

// --- Operación: READ ALL (pública) ---
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los posts', detalle: error.message });
  }
});

// --- Operación: READ ONE (pública) ---
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el post', detalle: error.message });
  }
});

// --- Operación: CREATE (protegida) ---
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, authorId } = req.body;

    if (!title || !content || !authorId) {
      return res.status(400).json({ error: 'Los campos title, content y authorId son requeridos' });
    }

    const newPost = await Post.create({
      title,
      content,
      authorId: parseInt(authorId)
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el post', detalle: error.message });
  }
});

// --- Operación: UPDATE (protegida) ---
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Update only the fields present in the request body
    await post.update({
      title: title !== undefined ? title : post.title,
      content: content !== undefined ? content : post.content,
      authorId: authorId !== undefined ? authorId : post.authorId
    });

    res.json({ message: 'Post actualizado correctamente', post });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el post', detalle: error.message });
  }
});

// --- Operación: DELETE (protegida) ---
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    await post.destroy();
    res.json({ message: 'Post eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el post', detalle: error.message });
  }
});

module.exports = router;
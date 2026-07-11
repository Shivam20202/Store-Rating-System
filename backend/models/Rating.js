import pool from '../config/db.js';

const Rating = {
  /**
   * Find a rating by user + store (unique pair).
   */
  async findByUserAndStore(userId, storeId) {
    const [rows] = await pool.query(
      'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ? LIMIT 1',
      [userId, storeId]
    );
    return rows[0] || null;
  },

  /**
   * Find a rating by its primary key.
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new rating.
   */
  async create({ userId, storeId, rating }) {
    const [result] = await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    );
    return result.insertId;
  },

  /**
   * Update an existing rating's value.
   */
  async update(id, rating) {
    const [result] = await pool.query(
      'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [rating, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get all ratings for a store, including the rating user's info.
   */
  async getRatingsForStore(storeId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.user_id, r.store_id, r.rating, r.created_at, r.updated_at,
              u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [storeId]
    );
    return rows;
  },

  /**
   * Count all ratings in the system.
   */
  async countAll() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM ratings');
    return rows[0].total;
  },
};

export default Rating;

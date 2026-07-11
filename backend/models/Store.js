import pool from '../config/db.js';

const Store = {
  /**
   * Find a store by id.
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, owner_id, created_at FROM stores WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find a store by its owner's user id.
   */
  async findByOwnerId(ownerId) {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, owner_id, created_at FROM stores WHERE owner_id = ? LIMIT 1',
      [ownerId]
    );
    return rows[0] || null;
  },

  /**
   * Create a new store.
   */
  async create({ name, email, address, owner_id }) {
    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id]
    );
    return result.insertId;
  },

  /**
   * Get all stores with optional filters and sorting (paginated).
   * Includes the average rating per store.
   */
  async getAll({ name, email, address, search, sortBy, sortOrder, page, limit }) {
    const { where, params } = buildStoreWhere({ name, email, address, search });
    const allowedSort = ['id', 'name', 'email', 'address', 'created_at', 'avg_rating'];
    let sortField = allowedSort.includes(sortBy) ? sortBy : 'id';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
    const offset = (page - 1) * limit;

    // avg_rating is an alias, so it can't be qualified with table name
    const sortExpr = sortField === 'avg_rating' ? 'avg_rating' : `s.${sortField}`;

    const sql = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             COALESCE(AVG(r.rating), 0) AS avg_rating,
             COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${where}
      GROUP BY s.id
      ORDER BY ${sortExpr} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [...params, limit, offset]);
    return rows;
  },

  /**
   * Count stores matching the given filters.
   */
  async count({ name, email, address, search }) {
    const { where, params } = buildStoreWhere({ name, email, address, search });
    const sql = `SELECT COUNT(*) AS total FROM stores s ${where}`;
    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  },

  /**
   * Run a raw parameterized query via the shared pool. Exposed so other
   * models/controllers can perform batch lookups (e.g. a user's ratings for
   * a set of store ids) without duplicating pool plumbing.
   */
  async _poolQuery(sql, params) {
    return pool.query(sql, params);
  },

  /**
   * Get the average rating for a single store.
   */
  async getAvgRating(storeId) {
    const [rows] = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );
    return {
      avgRating: Number(rows[0].avg_rating) || 0,
      totalRatings: rows[0].total_ratings,
    };
  },
};

/**
 * Builds the WHERE clause and params for store filtering.
 * A `search` term matches against name OR address (combined search bar).
 * Individual `name`/`email`/`address` params are ANDed (admin filter form).
 */
function buildStoreWhere({ name, email, address, search }) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(s.name LIKE ? OR s.address LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  } else {
    if (name) {
      conditions.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push('s.email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push('s.address LIKE ?');
      params.push(`%${address}%`);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

export default Store;

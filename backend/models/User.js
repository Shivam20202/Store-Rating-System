import pool from '../config/db.js';

const User = {
  /**
   * Find a user by email.
   */
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, address, role, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by id (excludes password).
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user.
   */
  async create({ name, email, password, address, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, address, role]
    );
    return result.insertId;
  },

  /**
   * Update a user's password.
   */
  async updatePassword(id, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get all users with optional filters and sorting (paginated).
   */
  async getAll({ name, email, address, role, sortBy, sortOrder, page, limit }) {
    const { where, params } = buildUserWhere({ name, email, address, role });
    const allowedSort = ['id', 'name', 'email', 'address', 'role', 'created_at'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'id';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
    const offset = (page - 1) * limit;

    const sql = `
      SELECT id, name, email, address, role, created_at
      FROM users
      ${where}
      ORDER BY ${sortField} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [...params, limit, offset]);
    return rows;
  },

  /**
   * Count users matching the given filters.
   */
  async count({ name, email, address, role }) {
    const { where, params } = buildUserWhere({ name, email, address, role });
    const sql = `SELECT COUNT(*) AS total FROM users ${where}`;
    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  },
};

/**
 * Builds the WHERE clause and params for user filtering.
 */
function buildUserWhere({ name, email, address, role }) {
  const conditions = [];
  const params = [];

  if (name) {
    conditions.push('name LIKE ?');
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push('email LIKE ?');
    params.push(`%${email}%`);
  }
  if (address) {
    conditions.push('address LIKE ?');
    params.push(`%${address}%`);
  }
  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

export default User;

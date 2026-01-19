const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

class HyperismsDB {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'hyperisms.db');
    this.db = null;
  }

  async init() {
    const SQL = await initSqlJs();

    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.initDatabase();
  }

  initDatabase() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS hyperisms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote TEXT NOT NULL,
        added_by TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    this.save();
  }

  save() {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, data);
  }

  addHyperism(quote, addedBy) {
    // Get the next sequential ID
    const maxIdResult = this.db.exec('SELECT MAX(id) as maxId FROM hyperisms');
    const nextId = (maxIdResult.length > 0 && maxIdResult[0].values.length > 0 && maxIdResult[0].values[0][0] !== null)
      ? maxIdResult[0].values[0][0] + 1
      : 1;

    this.db.run('INSERT INTO hyperisms (id, quote, added_by) VALUES (?, ?, ?)', [nextId, quote, addedBy]);
    this.save();
    return nextId;
  }

  getRandomHyperism() {
    const result = this.db.exec('SELECT * FROM hyperisms ORDER BY RANDOM() LIMIT 1');
    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    return {
      id: row[0],
      quote: row[1],
      added_by: row[2],
      added_at: row[3]
    };
  }

  getAllHyperisms() {
    const result = this.db.exec('SELECT * FROM hyperisms ORDER BY added_at DESC');
    if (result.length === 0) return [];

    return result[0].values.map(row => ({
      id: row[0],
      quote: row[1],
      added_by: row[2],
      added_at: row[3]
    }));
  }

  getHyperismCount() {
    const result = this.db.exec('SELECT COUNT(*) as count FROM hyperisms');
    return result[0].values[0][0];
  }

  deleteHyperism(id) {
    const before = this.getHyperismCount();
    this.db.run('DELETE FROM hyperisms WHERE id = ?', [id]);

    // Reorganize IDs to remove gaps
    const allRows = this.db.exec('SELECT id, quote, added_by, added_at FROM hyperisms ORDER BY id ASC');

    if (allRows.length > 0 && allRows[0].values.length > 0) {
      // Clear the table
      this.db.run('DELETE FROM hyperisms');

      // Re-insert with sequential IDs
      allRows[0].values.forEach((row, index) => {
        this.db.run(
          'INSERT INTO hyperisms (id, quote, added_by, added_at) VALUES (?, ?, ?, ?)',
          [index + 1, row[1], row[2], row[3]]
        );
      });
    }

    this.save();
    const after = this.getHyperismCount();
    return before - after;
  }

  close() {
    if (this.db) {
      this.save();
      this.db.close();
    }
  }
}

module.exports = HyperismsDB;

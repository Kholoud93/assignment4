/*
============================================================
Assignment 4 - MySQL
============================================================
*/


/*
------------------------------------------------------------
Part 1: ERD Diagram (3 Grade)

Musicana records have decided to store information on musicians
who perform on their albums in a database.
------------------------------------------------------------

Each musician has an ID number, a name, an address (street, city),
and a phone number.

CREATE TABLE MUSICIAN (
    id INT PRIMARY KEY AUTO_INCREMENT,
    musician_name VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

Each instrument has a unique name and a musical key
(e.g., C, B-flat, E-flat).

CREATE TABLE INSTRUMENT(
  instrument_name VARCHAR(50) PRIMARY KEY,
  musical_key VARCHAR(50) NOT NULL
);

Each album has a unique title, a copyright date, and an album identifier.

CREATE TABLE ALBUM(
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL UNIQUE,
  copyrightDate DATE NOT NULL,
  producer_id INT,
  FOREIGN KEY (producer_id) REFERENCES MUSICIAN(id)
);

Each song has a unique title and an author.

CREATE TABLE SONG(
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL UNIQUE,
  author VARCHAR(100) NOT NULL,
  album_id INT,
  FOREIGN KEY (album_id) REFERENCES ALBUM(id)
);

Each musician may play several instruments, and a given instrument
may be played by several musicians.

CREATE TABLE PLAYS(
  musician_id INT,
  instrument_name VARCHAR(50),
  PRIMARY KEY (musician_id, instrument_name),
  FOREIGN KEY (musician_id) REFERENCES MUSICIAN(id),
  FOREIGN KEY (instrument_name) REFERENCES INSTRUMENT(instrument_name)
);

Each album has a number of songs on it, but no song may appear
on more than one album.

Each song is performed by one or more musicians, and a musician
may perform a number of songs.

CREATE TABLE PERFORMS(
  musician_id INT,
  song_id INT,
  PRIMARY KEY (musician_id, song_id),
  FOREIGN KEY (musician_id) REFERENCES MUSICIAN(id),
  FOREIGN KEY (song_id) REFERENCES SONG(id)
);

Each album has exactly one musician who acts as its producer.
A producer may produce several albums.

ERD Diagram:

Entities:
  MUSICIAN   (id PK, name, street, city, phone)
  INSTRUMENT (name PK, musical_key)
  ALBUM      (id PK, title UNIQUE, copyrightDate, producer_id FK)
  SONG       (id PK, title UNIQUE, author, album_id FK)

Relationships / Cardinality:
  MUSICIAN (M) ---- PLAYS ---- (N) INSTRUMENT
  MUSICIAN (1) ---- PRODUCES ---- (N) ALBUM
      (each album has exactly one producer)
  ALBUM (1) ---- CONTAINS ---- (N) SONG
      (a song appears on at most one album)
  MUSICIAN (M) ---- PERFORMS ---- (N) SONG

ASCII ERD:

                    +-------------+
                    |  INSTRUMENT |
                    |-------------|
                    | PK name     |
                    | musical_key |
                    +------+------+
                           |
                         N | PLAYS (M:N)
                           |
+-------------+     +------+------+     +-------------+
|  MUSICIAN   |     |    PLAYS    |     |    ALBUM    |
|-------------|     |-------------|     |-------------|
| PK id       |1---N| musician_id |     | PK id       |
| name        |     | instrument  |     | title UQ    |
| street      |     +-------------+     | copyrightDt |
| city        |                         | producer_id |
| phone       |1--------- PRODUCES ----N| FK -> MUSIC |
+------+------+                         +------+------+
       |                                       |
       |                                       | 1 CONTAINS
       |                                       | N
       |                                +------+------+
       |                                |    SONG     |
       |                                |-------------|
       |                                | PK id       |
       |                                | title UQ    |
       |                                | author      |
       |                                | album_id FK |
       |                                +------+------+
       |                                       |
       |              +-------------+          |
       +-----M--------+  PERFORMS   +------N---+
                      |-------------|
                      | musician_id |
                      | song_id     |
                      +-------------+

Relational Schema / Mapping:

MUSICIAN (id, name, street, city, phone)
  PK: id

INSTRUMENT (name, musical_key)
  PK: name

ALBUM (id, title, copyrightDate, producer_id)
  PK: id
  UQ: title
  FK: producer_id -> MUSICIAN(id)

SONG (id, title, author, album_id)
  PK: id
  UQ: title
  FK: album_id -> ALBUM(id)

PLAYS (musician_id, instrument_name)
  PK: (musician_id, instrument_name)
  FK: musician_id -> MUSICIAN(id)
  FK: instrument_name -> INSTRUMENT(name)

PERFORMS (musician_id, song_id)
  PK: (musician_id, song_id)
  FK: musician_id -> MUSICIAN(id)
  FK: song_id -> SONG(id)
*/


/*
------------------------------------------------------------
Part 2: Design a schema (Mapping) for the following ERD (2 Grade)

User
- id
- firstName
- lastName
- userName
- phone
- email
- role
- password

Product
- id
- name
- stock
- price
- isDeleted

Relationship: Own
User (1) ---- Own ---- (n) Product
One user owns many products.
------------------------------------------------------------

CREATE TABLE USER (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  userName VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE PRODUCT (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  stock INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES USER(id)
);
*/


/*
------------------------------------------------------------
Part 3 scenario (Using Node.js and MySQL)

The small retail store needs a RESTful API to manage information
about its products, suppliers, and sales.

Products
- ProductID: integer, primary key, auto-increment
- ProductName: text
- Price: decimal
- StockQuantity: integer
- SupplierID: integer, foreign key referencing Suppliers

Suppliers
- SupplierID: integer, primary key, auto-increment
- SupplierName: text
- ContactNumber: text

Sales
- SaleID: integer, primary key, auto-increment
- ProductID: integer, foreign key referencing Products
- QuantitySold: integer
- SaleDate: date
------------------------------------------------------------
*/

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

let pool;

/*
------------------------------------------------------------
Question 1 (0.5 Grade)

Configure a MySQL connection pool using mysql2/promise, create the
required database (if it does not exist), and create the Products,
Suppliers, and Sales tables with the appropriate primary and foreign
key relationships.
------------------------------------------------------------
*/

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS store_db`);
  await connection.end();

  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'store_db',
    waitForConnections: true,
    connectionLimit: 10
  });
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Suppliers (
      SupplierID INT PRIMARY KEY AUTO_INCREMENT,
      SupplierName VARCHAR(100) NOT NULL,
      ContactNumber VARCHAR(255)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Products (
      ProductID INT PRIMARY KEY AUTO_INCREMENT,
      ProductName VARCHAR(100),
      Price DECIMAL(10, 2) NOT NULL,
      StockQuantity INT NOT NULL,
      SupplierID INT,
      FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Sales (
      SaleID INT PRIMARY KEY AUTO_INCREMENT,
      ProductID INT,
      QuantitySold INT NOT NULL,
      SaleDate DATE NOT NULL,
      FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
    )
  `);
}

/*
------------------------------------------------------------
Question 2 (2.5 Grade)

Create REST API endpoints to perform CRUD operations for the
Products table.
------------------------------------------------------------
*/

app.post('/products', async (req, res) => {
  try {
    const { ProductName, Price, StockQuantity, SupplierID } = req.body;
    const [result] = await pool.query(
      `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID)
       VALUES (?, ?, ?, ?)`,
      [ProductName, Price, StockQuantity, SupplierID]
    );
    res.status(201).json({ message: 'Product created', ProductID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Products`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Products WHERE ProductID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { ProductName, Price, StockQuantity, SupplierID } = req.body;
    const [result] = await pool.query(
      `UPDATE Products
       SET ProductName = ?, Price = ?, StockQuantity = ?, SupplierID = ?
       WHERE ProductID = ?`,
      [ProductName, Price, StockQuantity, SupplierID, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM Products WHERE ProductID = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 3 (2 Grade)

Create REST API endpoints to perform CRUD operations for the
Suppliers table.
------------------------------------------------------------
*/

app.post('/suppliers', async (req, res) => {
  try {
    const { SupplierName, ContactNumber } = req.body;
    const [result] = await pool.query(
      `INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)`,
      [SupplierName, ContactNumber]
    );
    res.status(201).json({ message: 'Supplier created', SupplierID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Suppliers`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/suppliers/:id', async (req, res) => {
  try {
    const { SupplierName, ContactNumber } = req.body;
    const [result] = await pool.query(
      `UPDATE Suppliers
       SET SupplierName = ?, ContactNumber = ?
       WHERE SupplierID = ?`,
      [SupplierName, ContactNumber, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json({ message: 'Supplier updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/suppliers/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM Suppliers WHERE SupplierID = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 4 (1.5 Grade)

Create REST API endpoints to manage Sales.
------------------------------------------------------------
*/

app.post('/sales', async (req, res) => {
  try {
    const { ProductID, QuantitySold, SaleDate } = req.body;
    const [result] = await pool.query(
      `INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)`,
      [ProductID, QuantitySold, SaleDate]
    );
    res.status(201).json({ message: 'Sale recorded', SaleID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/sales', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Sales`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/sales/product/:productId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Sales WHERE ProductID = ?`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 5 (2 Grade)

Create API endpoints to perform the following database modifications.
------------------------------------------------------------
*/

app.post('/alter/add-category', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE Products ADD COLUMN Category VARCHAR(100)`);
    res.json({ message: 'Category column added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/alter/remove-category', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE Products DROP COLUMN Category`);
    res.json({ message: 'Category column removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/alter/contact-number', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE Suppliers MODIFY ContactNumber VARCHAR(15)`);
    res.json({ message: 'ContactNumber changed to VARCHAR(15)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/alter/product-name-not-null', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE Products MODIFY ProductName VARCHAR(100) NOT NULL`);
    res.json({ message: 'NOT NULL constraint added to ProductName' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 6 (1.5 Grade)

Create an API endpoint or initialization script to insert the
following data.
------------------------------------------------------------
*/

app.post('/seed', async (req, res) => {
  try {
    const [supplierResult] = await pool.query(
      `INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)`,
      ['FreshFoods', '01001234567']
    );
    const supplierId = supplierResult.insertId;

    await pool.query(
      `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES
       (?, ?, ?, ?),
       (?, ?, ?, ?),
       (?, ?, ?, ?)`,
      [
        'Milk', 15.00, 50, supplierId,
        'Bread', 10.00, 30, supplierId,
        'Eggs', 20.00, 40, supplierId
      ]
    );

    const [milkRows] = await pool.query(
      `SELECT ProductID FROM Products WHERE ProductName = ?`,
      ['Milk']
    );

    await pool.query(
      `INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)`,
      [milkRows[0].ProductID, 2, '2025-05-20']
    );

    res.status(201).json({ message: 'Seed data inserted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 7 (0.5 Grade)

Create an API endpoint to update the price of 'Bread' to 25.00.
------------------------------------------------------------
*/

app.put('/update-bread-price', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE Products SET Price = ? WHERE ProductName = ?`,
      [25.00, 'Bread']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bread not found' });
    }
    res.json({ message: 'Bread price updated to 25.00' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 8 (0.5 Grade)

Create an API endpoint to delete the product 'Eggs'.
------------------------------------------------------------
*/

app.delete('/delete-eggs', async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM Products WHERE ProductName = ?`,
      ['Eggs']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Eggs not found' });
    }
    res.json({ message: 'Eggs product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 9 (0.5 Grade)

Create a reporting endpoint to retrieve the total quantity sold
for each product using SQL aggregate functions.
------------------------------------------------------------
*/

app.get('/reports/total-quantity-sold', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.ProductName, SUM(s.QuantitySold) AS TotalQuantitySold
      FROM Products p
      JOIN Sales s ON p.ProductID = s.ProductID
      GROUP BY p.ProductID, p.ProductName
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 10 (0.5 Grade)

Create a reporting endpoint to retrieve the product with the
highest stock quantity.
------------------------------------------------------------
*/

app.get('/reports/highest-stock', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM Products
      ORDER BY StockQuantity DESC
      LIMIT 1
    `);
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 11 (0.5 Grade)

Create a reporting endpoint to retrieve suppliers whose names
start with 'F'.
------------------------------------------------------------
*/

app.get('/reports/suppliers-start-f', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Suppliers WHERE SupplierName LIKE ?`,
      ['F%']
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 12 (0.5 Grade)

Create a reporting endpoint to retrieve all products that have
never been sold.
------------------------------------------------------------
*/

app.get('/reports/never-sold', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*
      FROM Products p
      LEFT JOIN Sales s ON p.ProductID = s.ProductID
      WHERE s.SaleID IS NULL
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 13 (0.5 Grade)

Create a reporting endpoint to retrieve all sales including:
- Product name
- Quantity sold
- Sale date
using SQL JOIN operations.
------------------------------------------------------------
*/

app.get('/reports/sales-details', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.ProductName, s.QuantitySold, s.SaleDate
      FROM Sales s
      JOIN Products p ON s.ProductID = p.ProductID
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 14 (0.5 Grade)

Create a SQL script or secure administrative endpoint to create a
MySQL user named store_manager and grant the following permissions
on all tables:
- SELECT
- INSERT
- UPDATE
------------------------------------------------------------
*/

app.post('/admin/create-store-manager', async (req, res) => {
  try {
    await pool.query(
      `CREATE USER IF NOT EXISTS 'store_manager'@'localhost' IDENTIFIED BY 'store123'`
    );
    await pool.query(
      `GRANT SELECT, INSERT, UPDATE ON store_db.* TO 'store_manager'@'localhost'`
    );
    await pool.query(`FLUSH PRIVILEGES`);
    res.json({ message: 'store_manager user created with SELECT, INSERT, UPDATE' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 15 (0.5 Grade)

Revoke the UPDATE permission from "store_manager".
------------------------------------------------------------
*/

app.post('/admin/revoke-update', async (req, res) => {
  try {
    await pool.query(
      `REVOKE UPDATE ON store_db.* FROM 'store_manager'@'localhost'`
    );
    await pool.query(`FLUSH PRIVILEGES`);
    res.json({ message: 'UPDATE permission revoked from store_manager' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Question 16 (0.5 Grade)

Grant DELETE permission to "store_manager" only on the Sales table.
------------------------------------------------------------
*/

app.post('/admin/grant-delete-sales', async (req, res) => {
  try {
    await pool.query(
      `GRANT DELETE ON store_db.Sales TO 'store_manager'@'localhost'`
    );
    await pool.query(`FLUSH PRIVILEGES`);
    res.json({ message: 'DELETE granted to store_manager on Sales table' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
------------------------------------------------------------
Bonus (2 Grades)

Solve "Customer Who Visited but Did Not Make Any Transactions"
on LeetCode.

Put the code you submit on LeetCode in bonus.txt.
------------------------------------------------------------
*/

async function startServer() {
  try {
    await createDatabase();
    await createTables();
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
}

startServer();

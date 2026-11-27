/*==========================
    Modelos de ventas
==========================*/
import connection from "../database/db.js";


/////////////////////////////
// Insertamos nueva venta
const insertNewSale = (date, total_price, user_name) => {
    // Insertamos la venta en la tabla 'sales'
    const sql = "INSERT into sales (date, total_price, user_name) values (?, ?, ?)";
    return connection.query(sql, [date, total_price, user_name]);
}

/////////////////////////////
// Insertamos en product_sales
const insertIntoProductSales = (productId, saleId) => {
    const sql = "INSERT INTO product_sales (product_id, sale_id) VALUES (?, ?)";
    return connection.query(sql, [productId, saleId]);
}

// Obtiene todas las ventas ordenadas de la más reciente a la más vieja
const getAllSales = () => {
  const sql = "SELECT id, date, total_price, user_name FROM sales ORDER BY id DESC";
  return connection.query(sql);
};

// Obtiene una venta por ID
const getSaleById = (id) => {
  const sql = "SELECT id, date, total_price, user_name FROM sales WHERE id = ?";
  return connection.query(sql, [id]);
};


export default {
    insertNewSale,
    insertIntoProductSales,
    getAllSales,
    getSaleById,
}
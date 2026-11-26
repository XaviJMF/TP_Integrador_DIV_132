/*==========================
	Modelos de producto
==========================*/
import connection from "../database/db.js";



/////////////////////////////
// Traer una pagina de productos activos
// limit = cuantos productos devolver | offset = cuantos productos saltear
const selectActiveProducts = (limit, offset, category, search) => {
    let sql = "SELECT id, name, price, image, category FROM products WHERE active = 1";
    let valores = [];

    // Si llega una categoria, filtramos por ella
    if (category) {
        sql += " AND category = ?";
        valores.push(category);
    }

    // Si llega texto de busqueda, filtramos los nombres que lo contengan
    if (search) {
        sql += " AND name LIKE ?";
        valores.push("%" + search + "%");
    }

    sql += " ORDER BY id LIMIT ? OFFSET ?";
    valores.push(limit);
    valores.push(offset);

    return connection.query(sql, valores);
}



/////////////////////////////
// Contar cuantos productos activos hay en total (con los mismos filtros)
// Sirve para saber cuantas paginas hay
const countActiveProducts = (category, search) => {
    let sql = "SELECT COUNT(*) AS total FROM products WHERE active = 1";
    let valores = [];

    if (category) {
        sql += " AND category = ?";
        valores.push(category);
    }

    if (search) {
        sql += " AND name LIKE ?";
        valores.push("%" + search + "%");
    }

    return connection.query(sql, valores);
}



/////////////////////////////
// Traer todos los productos
const selectAllProducts = () => {
    // Optimizacion 2: Solo devolvemos los campos necesarios, no todo
    const sql = "SELECT id, name, price, image, category, active FROM products";
    return connection.query(sql);
};



///////////////////////////
// Traer producto por id
const selectProductById = (id) => {
    // Optimizacion 3: Solo devolvemos los campos necesarios, no todo
    // Gracias a los ? (placeholders) nuestra consulta SQL es mas segura porque evitamos consultas vulnerables
    const sql = "SELECT id, name, price, image, active FROM products WHERE products.id = ?";
    return connection.query(sql, [id]);
}



///////////////////////////
// Crear nuevo producto
const insertNewProduct = (name, image, category, price) => {

    const sql = "INSERT INTO products (name, image, category, price) VALUES (?, ?, ?, ?)"
    return connection.query(sql, [name, image, category, price]);
}



///////////////////////////
// Actualizar producto
const updateProduct = (name, image, price, category, active, id) => {
    const sql = "UPDATE products SET name = ?, image = ?, price = ?, category = ?, active = ? WHERE id = ?";

    return connection.query(sql, [name, image, price, category, active, id]);
}



///////////////////////////
// Eliminar producto
const deleteProduct = (id) => {
    const sql = "DELETE FROM products WHERE id = ?";
    return connection.query(sql, [id]);
}



export default {
    selectAllProducts,
    selectProductById,
    insertNewProduct,
    updateProduct,
    deleteProduct,
    selectActiveProducts,
    countActiveProducts
}
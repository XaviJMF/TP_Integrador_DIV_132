import connection from "../database/db.js";
import ProductModels from "../models/product.model.js"

///////////////////
// GET active products -> Obtener productos activos PAGINADOS
// Ejemplo: /api/products/active?page=2&category=food&search=pan
export const getActiveProducts = async (req, res) => {
    try {
        // 1. Leemos los datos de la URL (req.query siempre trae texto)
        const limit = 10; // productos por pagina
        let page = Number(req.query.page); // pasamos a numero
        const category = req.query.category;
        const search = req.query.search;

        // 2. Si page no es un numero valido o es menor a 1, usamos la pagina 1
        if (!page || page < 1) {
            page = 1;
        }

        // 3. Contamos cuantos productos activos hay en total
        const [filas] = await ProductModels.countActiveProducts(category, search);
        const total = filas[0].total;

        // 4. Calculamos el total de paginas (division entera + 1 si sobran productos)
        let totalPages = (total / limit) | 0;
        if (total % limit !== 0) {
            totalPages = totalPages + 1;
        }
        if (totalPages < 1) {
            totalPages = 1;
        }

        // 5. Si piden una pagina que no existe, usamos la ultima
        if (page > totalPages) {
            page = totalPages;
        }

        // 6. Calculamos cuantos productos saltear y traemos solo los de esa pagina
        const offset = (page - 1) * limit;
        const [rows] = await ProductModels.selectActiveProducts(limit, offset, category, search);

        // 7. Si no hay resultados NO es un error: devolvemos 200 con la lista vacia
        res.status(200).json({
            payload: rows,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: totalPages
            }
        });

    } catch (error) {
        console.log("Error obteniendo productos activos: ", error);

        res.status(500).json({
            message: "Error interno del servidor al obtener productos activos"
        });
    }
}



///////////////////
// GET all products -> Obtener todos los productos

export const getAllProducts = async (req, res) => {
    // Optimizacion 1: Manejamos errores con try...catch
    try {
        
        // El controlador llama al modelo
        const [rows, tables] = await ProductModels.selectAllProducts();


        // Optimizacion 3: Devolvemos 404 si no hay productos
        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron productos"
            });
        }

        res.status(200).json({
            payload: rows,
        });

    } catch (error) {
        console.log("Error obteniendo productos: ", error);

        // Optimizacion 4: Devolvemos error 500 si algo fallo en la conexion
        // Ej: Fallo la conexion a la BBDD, tardo demasiado, la tabla no existe, error de sintaxis
        res.status(500).json({
            message: "Error interno del servidor al obtener productos"
        });
    }
}



///////////////////
// GET product by id -> Obtener producto por id

export const getProductById = async (req, res) => {
    // Optimizacion 1: validamos el id y lo agregamos a req.id con el middleware validateId

    // Optimizacion 2: manejo de errores con try...catch
    try {

        const [rows] = await ProductModels.selectProductById(req.id);


        // Optimizacion 4: Devolvemos 404 si no existe producto con ese id
        if (!rows.length) { // Forma mas optima? en lugar de rows.length === 0
            return res.status(404).json({
                message: `No se encontro producto con id ${req.id}`
            });
        }

        // console.log(rows);
        res.status(200).json({
            payload: rows
        });

    } catch (error) {
        console.log("Error obteniendo producto: ", error);

        // Optimizacion 4: Devolvemos error 500 si algo fallo en la conexion
        // Ej: Fallo la conexion a la BBDD, tardo demasiado, la tabla no existe, error de sintaxis
        res.status(500).json({
            message: "Error interno del servidor al obtener producto por id"
        });
    }
}



///////////////////
// POST product -> Crear producto

export const createProduct = async (req, res) => {

    // Optimizacion 1: Validamos los productos con el middleware validateProduct

    // Optimizacion 2: Manejamos errores con try...catch
    try {
        const { category, image, name, price } = req.body;

        const [rows] = await ProductModels.insertNewProduct(name, image, category, price);


        res.status(201).json({
            message: "Producto creado con exito",
            productId: rows.insertId // Devolvemos el id que se acaba de asignar al prod
        });

    } catch (error) {
        console.log("Error creando producto: ", error);

        // Optimizacion 3: Devolvemos error 500 si algo fallo en la conexion
        // Ej: Fallo la conexion a la BBDD, tardo demasiado, la tabla no existe, error de sintaxis
        res.status(500).json({
            message: "Error interno del servidor al crear un producto"
        });
    }
}



///////////////////
// PUT product -> Modificar producto

export const modifyProduct = async (req, res) => {
    // Optimizacion 1: Validar el envio del formulario con el middleware validateProduct

    // Optimizacion 2: Manejamos los errores con try...catch 
    try {
        const { id, name, image, price, category, active } = req.body;

        const [result] = await ProductModels.updateProduct(name, image, price, category, active, id);

        console.log(result);

        // Optimizacion 4: Verificamos si realmente se actualizo algo
        if (result.changedRows === 0) {
            return res.status(404).json({
                message: `No se actualizo el producto`
            });
        }

        res.status(200).json({
            message: `Producto con id ${id} actualizado correctamente`
        });


    } catch (error) {
        console.log("Error modificando producto: ", error);

        // Optimizacion 3: Devolvemos error 500 si algo fallo en la conexion
        // Ej: Fallo la conexion a la BBDD, tardo demasiado, la tabla no existe, error de sintaxis
        res.status(500).json({
            message: "Error interno del servidor al modificar un producto"
        });
    }
}



///////////////////
// DELETE product -> Eliminar producto

export const removeProduct = async (req, res) => {
    // Optimizacion 1: Usar el middleware validateId

    // Optimizacion 2: Manejo de errores
    try {
        
        await ProductModels.deleteProduct(req.id);

        res.status(200).json({
            message: `Producto con id ${req.id} eliminado correctamente`
        });

    } catch (error) {
        console.log("Error eliminando producto: ", error);

        // Optimizacion 3: Devolvemos error 500 si algo fallo en la conexion
        // Ej: Fallo la conexion a la BBDD, tardo demasiado, la tabla no existe, error de sintaxis
        res.status(500).json({
            message: "Error interno del servidor al eliminar producto"
        });
    }
}
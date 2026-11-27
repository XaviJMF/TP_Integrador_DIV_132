/*===============================
	Controladores de ventas
===============================*/

import SaleModels from "../models/sale.models.js";

///////////////////
// POST sale -> Crear venta
export const createSale = async (req, res) => {

    try {

        // Recibimos los datos ya parseados del cuerpo de la peticion
        const { date, total_price, user_name, products } = req.body;

        // Validacion minima de datos
        if (!date || !total_price || !user_name || !Array.isArray(products) || products.length ===0 ) {
            return res.status(400).json({
                message: "Datos invalidos. Debes enviar date, total_price, user_name y products como array"
            });
        }

        // 1. INSERTAMOS LA VENTA EN "sales"
        const [saleResult] = await SaleModels.insertNewSale(date, total_price, user_name);

        // 2. OBTENEMOS EL ID DE LA VENTA recien creada
        const saleId = saleResult.insertId; // (igual que haciamos en create product)

        // 3. INSERTAR CADA PRODUCTO EN "product_sales"
        for (const productId of products) {
            await SaleModels.insertIntoProductSales(productId, saleId);
        }
        
        res.status(201).json({
            message: "Venta registrada con exito"
        });


    } catch (error) {
        console.log("Error creando venta: ", error);

        res.status(500).json({
            message: "Error interno del servidor al crear un producto"
        });
    }
}

///////////////////////////
export const getSales = async (req, res) => {
  try {
    const [rows] = await SaleModels.getAllSales();
    return res.status(200).json({
      payload: rows,
    });
  } catch (error) {
    console.error("Error obteniendo ventas:", error);
    return res.status(500).json({
      message: "Error interno del servidor al obtener ventas",
    });
  }
};

export const getSale = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await SaleModels.getSaleById(id);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Venta no encontrada",
      });
    }

    return res.status(200).json({
      payload: rows[0],
    });
  } catch (error) {
    console.error("Error obteniendo venta por ID:", error);
    return res.status(500).json({
      message: "Error interno del servidor al obtener la venta",
    });
  }
};
import { Router } from "express"; //importamos router
import {validateId, validateProduct } from "../middlewares/middleware.js";
import { createProduct, getAllProducts, getProductById, modifyProduct, removeProduct } from "../controllers/product.controllers.js";

const router = Router()


///////////////////
// GET all products -> Obtener todos los productos

router.get("/", getAllProducts);



///////////////////
// GET product by id -> Obtener producto por id

router.get("/:id", validateId, getProductById);



///////////////////
// POST product -> Crear producto

router.post("/", validateProduct, createProduct);



///////////////////
// PUT product -> Modificar producto

router.put("/", validateProduct, modifyProduct);



///////////////////
// DELETE product -> Eliminar producto

router.delete("/:id", validateId, removeProduct);
//exportamos 
export default router;
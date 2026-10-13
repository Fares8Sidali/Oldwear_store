import {Router} from "express"
import { createAdminProduct, getImageKitAuth, listAdminProducts, requireAdmin, updateAdminProduct } from "../controllers/adminController";

const router = Router()

router.use(requireAdmin)

router.get("/imagekit/auth",getImageKitAuth)

router.get("/products",listAdminProducts)

router.post("/products",createAdminProduct)

router.patch("/products/:id",updateAdminProduct)

/*router.get("/",listProducts)

router.get("/categories",getCategories)

router.get("/:slug",getProductBySlug)*/

export default router
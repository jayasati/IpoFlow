import { Router } from "express";
import { createSale, listSales } from "../controllers/sale.controller";

// mergeParams so ":id" from the parent application router (e.g. /applications/:id) is visible here.
export const saleRouter = Router({ mergeParams: true });

saleRouter.get("/sales", listSales);
saleRouter.post("/sales", createSale);

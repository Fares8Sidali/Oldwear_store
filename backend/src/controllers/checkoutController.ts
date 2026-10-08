import {Request,Response, NextFunction} from "express"
import {getEnv} from "../lib/env"
import z from "zod"
import { getAuth } from "@clerk/express";
import { getLocalUser } from "../lib/users";
import { db } from "../db";
import { CheckoutSessionLine, checkoutSessions, products } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { polarCreateCheckout } from "../lib/polar";

const env = getEnv()

const cartSchema = z.object({
    items:z.array(
        z.object({
            productId:z.string().uuid(),
            quantity:z.number().int().positive()
        })
    ).min(1)
})

export async function createCheckout(req:Request,res:Response,next:NextFunction){
    try{
        const {userId,isAuthenticated} = getAuth(req)
        if(!isAuthenticated || !userId){
            res.status(401).json({error:"Unauthorized"})
            return
        }

        const parsed = cartSchema.safeParse(req.body)
        if(!parsed.success){
            res.status(400).json({error:"Invalid request body",details:parsed.error.format()})
            return
        }

        if(!env.POLAR_ACCESS_TOKEN){
            res.status(503).json({error:"payment are not configured"})
            return
        }

        const localUser = await getLocalUser(userId)
        if(!localUser){
            res.status(503).json({error:"account not synced yet"})
            return
        }

        const ids = parsed.data.items.map((i)=>i.productId)

        const prodRows = await db.select().from(products).where(and(inArray(products.id,ids),eq(products.active,true)))
        if(prodRows.length !== ids.length){
            res.status(400).json({error:"Some products are invalid"})
            return
        }

        const byId = new Map(prodRows.map((p)=>[p.id,p]))
        let  total = 0
        const lines:CheckoutSessionLine[] = []

        for (const line of parsed.data.items){
            const p = byId.get(line.productId)
            if(!p){
                res.status(400).json({error:`Product ${line.productId} not found`})
                return
            }
            total += p.price * line.quantity
            lines.push({
                productId:p.id,
                quantity:line.quantity,
                unitPrice:p.price
            }) 
        }

        if(total < 10){
            res.status(400).json({error:"total below polar min"})
            return
        }

        const [session] = await db.insert(checkoutSessions)
                                  .values({
                                    userId:localUser.id,
                                    lines,
                                    total,
                                    currency:"DZD",
                                  }).returning()

    const successUrl = `${env.FRONTEND_URL}/checkout/return?checkout_id={CHECKOUT_ID}`

    const returnUrl = `${env.FRONTEND_URL}/cart`

    const checkout = await polarCreateCheckout(env,{
        products:[env.POLAR_CHECKOUT_PRODUCT_ID],
        prices:{
            [env.POLAR_CHECKOUT_PRODUCT_ID]:[
                {
                    amount_type:"fixed",
                    price_currency:"dzd",
                    price_amount:total
                }
            ]
        },
        success_url:successUrl,
        return_url:returnUrl,
        external_customer_id:userId,
        metadata:{checkout_session_id:session.id},
    })

    await db.update(checkoutSessions).set({polarCheckoutId:checkout.id})
                                     .where(eq(checkoutSessions.id,session.id))

    res.json({checkoutUrl:checkout.url})

    }catch(err){
        next(err)
    }
}
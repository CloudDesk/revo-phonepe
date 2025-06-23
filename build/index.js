"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const postgress_js_1 = require("./postgress.js");
const fastify = (0, fastify_1.default)({ logger: true });
fastify.get('/', async (request, reply) => {
    return { message: 'Hello, World!' };
});
fastify.post('/helloGET', async (request, reply) => {
    try {
        const { merchantid } = request.body;
        fastify.log.info('Req body:', request.body);
        fastify.log.info(`Merchant ID: ${merchantid}`);
        const orderIdQuery = `
      SELECT orderid, transactionid 
      FROM orders 
      WHERE merchanttransactionid = $1 
        AND ispaymentsucceed = FALSE 
        AND transactionid IS NULL
    `;
        const orderIdResult = await (0, postgress_js_1.query)(orderIdQuery, [merchantid]);
        if (orderIdResult.rows.length === 0) {
            fastify.log.info('No orders found for merchant id:', merchantid);
            return reply.status(200).send('Merchant Id Payment is successful');
        }
        const uniqueorderid = orderIdResult.rows[0].orderid;
        fastify.log.info('Unique Order Id:', uniqueorderid);
        const productIdOrderlineQuery = `
      SELECT productid 
      FROM orderline 
      WHERE uniqueorderid = $1
    `;
        const productIdOrderlineResult = await (0, postgress_js_1.query)(productIdOrderlineQuery, [uniqueorderid]);
        if (productIdOrderlineResult.rows.length > 0) {
            const productIds = productIdOrderlineResult.rows.map(row => row.productid);
            const updateLockQtyQuery = `
        UPDATE product_revo 
        SET lock_qty = 0 
        WHERE id = ANY($1::int[])
      `;
            await (0, postgress_js_1.query)(updateLockQtyQuery, [productIds]);
            fastify.log.info('Updated lock_qty for product ids:', productIds);
        }
        const deleteOrderlineQuery = `
      DELETE FROM orderline 
      WHERE uniqueorderid = $1
    `;
        await (0, postgress_js_1.query)(deleteOrderlineQuery, [uniqueorderid]);
        fastify.log.info('Deleted order lines for order id:', uniqueorderid);
        const deleteOrdersQuery = `
      DELETE FROM orders 
      WHERE orderid = $1
    `;
        await (0, postgress_js_1.query)(deleteOrdersQuery, [uniqueorderid]);
        fastify.log.info('Deleted order with order id:', uniqueorderid);
        reply.status(200).send('Data Deleted Successfully');
    }
    catch (error) {
        fastify.log.error('Error in helloGET handler:', error);
        reply.status(500).send('Internal Server Error');
    }
});
// Start the server
const start = async () => {
    try {
        fastify.listen({ port: 8080, host: '0.0.0.0' });
        fastify.log.info(`Server listening on port 8080`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map
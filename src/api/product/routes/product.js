'use strict';

/**
 * product router.
 */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::product.product');

// const { createCoreRouter } = require("@strapi/strapi").factories;
// const defaultRouter = createCoreRouter("api::product.product");

// const customRouter = (innerRouter, extraRoutes = []) => {
//     let routes;
//     return {
//         get prefix() {
//             return innerRouter.prefix;
//         },
//         get routes() {
//             if (!routes) routes = innerRouter.routes.concat(extraRoutes);
//             return routes;
//         },
//     };
// };

// const myExtraRoutes = [
//     {
//         method: "GET",
//         path: "/product/best-selling",
//         handler: "custom-controller.getBestSellingProducts",
//     }
// ];

// module.exports = customRouter(defaultRouter, myExtraRoutes);






const { createCoreRouter } = require("@strapi/strapi").factories;
const defaultRouter = createCoreRouter("api::product.product");

const customRouter = (innerRouter, extraRoutes = []) => {
    let routes;
    return {
        get prefix() {
            return innerRouter.prefix;
        },
        get routes() {
            if (!routes) routes = innerRouter.routes.concat(extraRoutes);
            return routes;
        },
    };
};

const myExtraRoutes = [
];

module.exports = customRouter(defaultRouter, myExtraRoutes);
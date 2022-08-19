module.exports = {
    routes: [
        {
            method: "GET",
            path: "/all-hellos",
            handler: "custom-controller.hello",
        },
        {
            method: "GET",
            path: "/products/best-selling",
            handler: "custom-controller.getBestSellingProducts",
        },
        {
            method: "GET",
            path: "/category/products",
            handler: "custom-controller.getShopProducts",
        },
        {
            method: "GET",
            path: "/product/:slug",
            handler: "custom-controller.getProductBySlug",
        }
    ],
};
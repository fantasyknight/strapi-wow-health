module.exports = {
    routes: [
        {
            method: "GET",
            path: "/category/sidebar-list",
            handler: "custom-controller.getCategories",
        }
    ],
};
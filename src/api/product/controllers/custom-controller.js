'use strict';

/**
 *  product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
// const strapi = require('@strapi/strapi');

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
    async getBestSellingProducts(ctx) {
        let products = await strapi.entityService.findMany('api::product.product', {
            populate: '*',
        });
        let sanitizedEntity = await this.sanitizeOutput(products, ctx);
        products = sanitizedEntity.filter(item => item.is_hot)

        return products;
    },
    async getShopProducts(ctx) {
        var tmpPicture = {
            "id": 1,
            "width": 1,
            "height": 1,
            "url": ''
        }
        var tmpCategory = {
            "id": 1,
            "name": '',
            "parent_name": 1,
            "demoes": '',
            "slug": ''
        }
        var tmpTag = {
            "id": 1,
            "name": '',
            "slug": ''
        }

        /** Getting and Setting variables and const variables*/
        const { demo } = ctx.query;
        const { category } = ctx.query;
        const { brand } = ctx.query;
        const { size } = ctx.query;
        const { color } = ctx.query;
        const { ratings } = ctx.query;
        const { order_by } = ctx.query;
        const { tag } = ctx.query;
        const { search_term } = ctx.query;
        let page;
        page = ctx.query.page ? ctx.query.page : 1;
        let per_page;
        per_page = ctx.query.per_page ? ctx.query.per_page : 12;
        let min_price, max_price;
        min_price = ctx.query.min_price ? ctx.query.min_price : 0;
        max_price = ctx.query.max_price ? ctx.query.max_price : 1700;
        let is_picture = ctx.query.is_picture ? ctx.query.is_picture : false;

        /** Getting Demo products */
        const demoEntities = await strapi.entityService.findMany('api::product.product', {
            populate: '*',
        });

        let demoProducts = demoEntities;

        for (let i = 0; i < demoProducts.length; i++) {
            for (let j = 0; j < demoProducts[i].large_pictures.length; j++) {
                var result = {};
                for (let key in demoProducts[i].large_pictures[j]) {
                    for (let keyj in tmpPicture) {
                        if (key === keyj) {
                            result[key] = demoProducts[i].large_pictures[j][key];
                        }
                    }
                }
                demoProducts[i].large_pictures[j] = result;
            }
            for (let j = 0; j < demoProducts[i].product_categories.length; j++) {
                var result = {};
                for (let key in demoProducts[i].product_categories[j]) {
                    for (let keyj in tmpCategory) {
                        if (key === keyj) {
                            result[key] = demoProducts[i].product_categories[j][key];
                        }
                    }
                }
                demoProducts[i].product_categories[j] = result;
            }
        }

        /** Getting SelectedCategory */
        let subCategories = [];
        if (category && category !== 'all') {
            let selectedCategory = await strapi.entityService.findMany('api::product-category.product-category', {
                filters: {
                    slug: category
                }
            });

            let selectedName = '';
            if (selectedCategory !== null) {
                selectedName = selectedCategory.name;
                if (selectedCategory.parent_name)
                    selectedName = selectedCategory.parent_name.concat(',', selectedName);
            }

            selectedCategory = await strapi.entityService.findMany('api::product-category.product-category', {
                filters: {
                    parent_name: selectedName
                }
            });
            subCategories = subCategories.filter(category => {
                return category.demoes.split(',').indexOf('demo' + demo) > -1
            })

            for (let i = 0; i < subCategories.length; i++) {
                let categoryName = selectedName.concat(',', subCategories[i].name);
                let grandSubCategories = await strapi.entityService.findMany('api::product-category.product-category', {
                    filters: {
                        parent_name: categoryName
                    }
                });
                grandSubCategories = grandSubCategories.filter(category => {
                    return category.demoes.split(',').indexOf('demo' + demo) > -1
                })
                for (let j = 0; j < grandSubCategories.length; j++) {
                    grandSubCategories[j].products = [];
                }
                subCategories = subCategories.concat(grandSubCategories);
            }
        }

        /** Getting Filtered Products */
        let filteredProducts = demoProducts.filter(product => {

            /** Header Search Filter */
            let searchFlag = false;
            if (search_term) {
                product.slug.includes(search_term) && (searchFlag = true);
            } else {
                searchFlag = true;
            }

            /** Category Filter */
            let categoryFlag = false;
            if (category && category !== 'all') {
                for (let i = 0; i < product.product_categories.length; i++) {
                    product.product_categories[i].slug === category && (categoryFlag = true);

                    subCategories.forEach(category => {
                        category.id === product.product_categories[i].id && (categoryFlag = true);
                    })
                }
            } else {
                categoryFlag = true;
            }

            /** Brand Filter */
            // let brandFlag = false;
            // if (brand && product.product_brands.length > 0) {
            //     brand.split(',').map(brand => {
            //         for (let i = 0; i < product.product_brands.length; i++) {
            //             product.product_brands[i].slug === brand && (brandFlag = true);
            //         }
            //     })
            // } else if (!brand) {
            //     brandFlag = true;
            // }

            /** Size Filter */
            // let sizeFlag = false;
            // if (product.variants.length > 0 && size) {
            //     size.split(',').map(size => {
            //         for (let i = 0; i < product.variants.length; i++) {
            //             for (let j = 0; j < product.variants[i].size.length; j++) {
            //                 product.variants[i].size[j].size === size && (sizeFlag = true);
            //             }
            //         }
            //     })
            // } else if (!size) {
            //     sizeFlag = true;
            // }

            /** Color Filter */
            // let colorFlag = false;
            // if (product.variants.length > 0 && color) {
            //     color.split(',').map(color => {
            //         for (let i = 0; i < product.variants.length; i++) {
            //             for (let j = 0; j < product.variants[i].colors.length; j++) {
            //                 product.variants[i].colors[j].color_name === color && (colorFlag = true);
            //             }
            //         }
            //     })
            // } else if (!color) {
            //     colorFlag = true;
            // }

            /** Tag Filter */
            // let tagFlag = false;
            // if (tag && product.product_tags.length > 0) {
            //     product.product_tags.map(item => {
            //         item.slug === tag && (tagFlag = true)
            //     })
            // } else if (!tag) {
            //     tagFlag = true;  
            // }

            /** Ratings Filter */
            let ratingFlag = false;
            if (ratings) {
                ratings.split(',').map(rating => {
                    product.ratings === parseInt(rating) && (ratingFlag = true)
                })
            } else if (!ratings) {
                ratingFlag = true
            }

            /** Price Filter */
            // let priceFlag = false;
            // if (product.variants.length > 0) {
            //     let flag = true;

            //     for (let i = 0; i < product.variants.length; i++) {
            //         if (((min_price > product.variants[i].price || product.variants[i].price > max_price) && product.variants[i].sale_price === null) || ((min_price > product.variants[i].sale_price || product.variants[i].sale_price > max_price) && product.variants[i].sale_price))
            //             flag = false;
            //     }
            //     if (product.sale_price && (min_price > product.sale_price || product.sale_price > max_price))
            //         flag = false;
            //     else if (product.sale_price === null && product.price && (min_price > product.price || product.price > max_price))
            //         flag = false;
            //     priceFlag = flag;
            // } else if (product.sale_price) {
            //     (min_price < product.sale_price && product.sale_price < max_price) && (priceFlag = true);
            // } else {
            //     (min_price < product.price && product.price < max_price) && (priceFlag = true);
            // }

            return categoryFlag;
        })

        filteredProducts = filteredProducts.sort(function (a, b) {
            return a.id - b.id;
        })

        switch (order_by) {
            case 'new':
                filteredProducts.sort(function (a, b) {
                    var newA = (a.is_new === true ? 1 : 0);
                    var newB = (b.is_new === true ? 1 : 0);
                    if (newA < newB) {
                        return 1;
                    } else if (newA === newB) {
                        return 0;
                    } else {
                        return -1;
                    }
                });
                break;
            case 'featured':
                filteredProducts.sort(function (a, b) {
                    var featuredA = (a.is_hot === true ? 1 : 0);
                    var featuredB = (b.is_hot === true ? 1 : 0);
                    if (featuredA < featuredB) {
                        return 1;
                    } else if (featuredA === featuredB) {
                        return 0;
                    } else {
                        return -1;
                    }
                });
                break;
            case 'rating':
                filteredProducts.sort(function (a, b) {
                    return b.ratings - a.ratings;
                });
                break;
            case 'price-asc':
                filteredProducts.sort(function (a, b) {
                    var priceA = 100000, priceB = 100000;
                    priceA = a.sale_price ? a.sale_price : a.price ? a.price : 100000;
                    if (a.variants && priceA === 100000) {
                        for (let i = 0; i < a.variants.length; i++) {
                            let tmpPrice = a.variants[i].sale_price ? a.variants[i].sale_price : a.variants[i].price ? a.variants[i].price : 100000;
                            priceA = priceA > tmpPrice ? tmpPrice : priceA;
                        }
                    }
                    priceB = b.sale_price ? b.sale_price : b.price ? b.price : 100000;
                    if (b.variants && priceB === 100000) {
                        for (let i = 0; i < b.variants.length; i++) {
                            let tmpPrice = b.variants[i].sale_price ? b.variants[i].sale_price : b.variants[i].price ? b.variants[i].price : 100000;
                            priceB = priceB > tmpPrice ? tmpPrice : priceB;
                        }
                    }
                    if (priceA > priceB) {
                        return 1;
                    } else if (priceA === priceB) {
                        return 0;
                    } else {
                        return -1;
                    }
                })
                break;
            case 'price-dec':
                filteredProducts.sort(function (a, b) {
                    var priceA = 100000, priceB = 100000;
                    priceA = a.sale_price ? a.sale_price : a.price ? a.price : 100000;
                    if (a.variants && priceA === 100000) {
                        for (let i = 0; i < a.variants.length; i++) {
                            let tmpPrice = a.variants[i].sale_price ? a.variants[i].sale_price : a.variants[i].price ? a.variants[i].price : 100000;
                            priceA = priceA > tmpPrice ? tmpPrice : priceA;
                        }
                    }
                    priceB = b.sale_price ? b.sale_price : b.price ? b.price : 100000;
                    if (b.variants && priceB === 100000) {
                        for (let i = 0; i < b.variants.length; i++) {
                            let tmpPrice = b.variants[i].sale_price ? b.variants[i].sale_price : b.variants[i].price ? b.variants[i].price : 100000;
                            priceB = priceB > tmpPrice ? tmpPrice : priceB;
                        }
                    }
                    if (priceA < priceB) {
                        return 1;
                    } else if (priceA === priceB) {
                        return 0;
                    } else {
                        return -1;
                    }
                })
                break;
            default:
                break;
        }

        // return 'totalCount';
        console.log("filterProducts", filteredProducts);
        return { 'totalCount': filteredProducts.length, 'products': filteredProducts.slice((page - 1) * per_page, page * per_page) };
    },
    async getProductBySlug(ctx) {
        var tmpPicture = {
            "id": 1,
            "width": 1,
            "height": 1,
            "url": ''
        }
        var tmpCategory = {
            "id": 1,
            "name": '',
            "parent_name": 1,
            "demoes": '',
            "slug": ''
        }

        /** Getting variables */
        const { slug } = ctx.params;
        let is_best = ctx.query.is_best ? ctx.query.is_best : 'false';
        let is_special = ctx.query.is_special ? ctx.query.is_special : 'true';
        let quick_view = ctx.query.quick_view ? ctx.query.quick_view : false;
        let categories, filteredProductIds = [];

        /** Getting Categories */
        let entity = await strapi.entityService.findMany('api::product.product', {
            populate: '*',
            filters: {
                slug: slug
            }
        });
        entity = entity[0];

        for (let i = 0; i < entity.product_categories.length; i++) {
            var result = {};
            for (let key in entity.product_categories[i]) {
                for (let keyj in tmpCategory) {
                    if (key === keyj) {
                        result[key] = entity.product_categories[i][key];
                    }
                }
            }
            entity.product_categories[i] = result;
        }
        for (let i = 0; i < entity.large_pictures.length; i++) {
            var result = {};
            for (let key in entity.large_pictures[i]) {
                for (let keyj in tmpPicture) {
                    if (key === keyj) {
                        result[key] = entity.large_pictures[i][key];
                    }
                }
            }
            entity.large_pictures[i] = result;
        }

        if (quick_view) {
            return { 'product': entity }
        }
        const category = entity.product_categories;

        /** Getting Filtered product Ids */
        for (let i = 0; i < category.length; i++) {
            let categories = await strapi.entityService.findMany('api::product-category.product-category', {
                populate: "*",
                filters: {
                    slug: category[i].slug
                }
            });

            for (let j = 0; j < categories.length; j++) {
                // let pp = categories[ j ].parent_name.split( ',' );
                // return pp.indexOf( category[ i ] )
                // if(categories[j].parent_name.split(',').indexof(category[i].name))
                let ids = categories[j].products.reduce((acc, cur) => {
                    return [...acc, cur.id];
                }, []);
                filteredProductIds = [...filteredProductIds, ...ids];
            }
        }

        filteredProductIds = filteredProductIds.reduce((acc, cur) => {
            if (acc.includes(cur)) return acc;
            return [...acc, cur]
        }, []);

        filteredProductIds = filteredProductIds.sort(function (a, b) {
            return a - b;
        })

        /** Getting Related products */
        let relatedProducts = await strapi.entityService.findMany('api::product.product', {
            populate: "*",
            filters: {
                id: filteredProductIds
            }
        });

        for (let i = 0; i < relatedProducts.length; i++) {
            relatedProducts[i].product_tags = [];
            relatedProducts[i].product_brands = [];
            for (let j = 0; j < relatedProducts[i].large_pictures.length; j++) {
                var result = {};
                for (let key in relatedProducts[i].large_pictures[j]) {
                    for (let keyj in tmpPicture) {
                        if (key === keyj) {
                            result[key] = relatedProducts[i].large_pictures[j][key];
                        }
                    }
                }
                relatedProducts[i].large_pictures[j] = result;
            }
            for (let j = 0; j < relatedProducts[i].product_categories.length; j++) {
                var result = {};
                for (let key in relatedProducts[i].product_categories[j]) {
                    for (let keyj in tmpCategory) {
                        if (key === keyj) {
                            result[key] = relatedProducts[i].product_categories[j][key];
                        }
                    }
                }
                relatedProducts[i].product_categories[j] = result;
            }
        }

        /** Getting prev and Next Product */
        let curIndex = -1;
        let prevProduct = null;
        let nextProduct = null;
        relatedProducts.map((item, index) => {
            if (item.id == entity.id) curIndex = index;
        });
        if (curIndex >= 1)
            prevProduct = relatedProducts[curIndex - 1];
        else prevProduct = null;

        if (curIndex < relatedProducts.length - 1)
            nextProduct = relatedProducts[curIndex + 1];
        else nextProduct = null;

        relatedProducts = relatedProducts.filter(product => {
            return product.id !== entity.id;
        })

        return { 'product': entity, 'relatedProducts': relatedProducts, 'prevProduct': prevProduct, 'nextProduct': nextProduct };
    },
    async hello() {
        console.log("all hello");
        return "hello";
    }
}));